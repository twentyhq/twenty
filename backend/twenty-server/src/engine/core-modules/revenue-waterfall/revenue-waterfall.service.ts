import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RevenueWaterfallEntity, BookingEntryEntity, ChurnEntryEntity, ExpansionEntryEntity,
  WaterfallPeriod, BookingType, RevenueSegment,
} from './revenue-waterfall.entity';

@Injectable()
export class RevenueWaterfallService {
  private readonly logger = new Logger(RevenueWaterfallService.name);

  constructor(
    @InjectRepository(RevenueWaterfallEntity) private readonly waterfallRepo: Repository<RevenueWaterfallEntity>,
    @InjectRepository(BookingEntryEntity) private readonly bookingRepo: Repository<BookingEntryEntity>,
    @InjectRepository(ChurnEntryEntity) private readonly churnRepo: Repository<ChurnEntryEntity>,
    @InjectRepository(ExpansionEntryEntity) private readonly expansionRepo: Repository<ExpansionEntryEntity>,
  ) {}

  async calculateWaterfall(workspaceId: string, periodStart: Date, periodEnd: Date, period: WaterfallPeriod = WaterfallPeriod.MONTHLY): Promise<RevenueWaterfallEntity> {
    const bookings = await this.bookingRepo.find({ where: { workspaceId } });
    const churns = await this.churnRepo.find({ where: { workspaceId } });
    const expansions = await this.expansionRepo.find({ where: { workspaceId } });

    const periodBookings = bookings.filter((b) => {
      const d = new Date(b.bookingDate);
      return d >= periodStart && d <= periodEnd;
    });

    const periodChurns = churns.filter((c) => {
      const d = new Date(c.churnDate);
      return d >= periodStart && d <= periodEnd;
    });

    const periodExpansions = expansions.filter((e) => {
      const d = new Date(e.expansionDate);
      return d >= periodStart && d <= periodEnd;
    });

    const newBookingsARR = periodBookings
      .filter((b) => b.type === BookingType.NEW)
      .reduce((s, b) => s + Number(b.arrImpact), 0);

    const expansionRevenue = periodExpansions.reduce((s, e) => s + Number(e.expansionAmount), 0);

    const contractionBookings = periodBookings
      .filter((b) => b.type === BookingType.CONTRACTION)
      .reduce((s, b) => s + Math.abs(Number(b.arrImpact)), 0);

    const churnedRevenue = periodChurns.reduce((s, c) => s + Number(c.lostARR), 0);

    // Get previous waterfall for opening ARR
    const previousWaterfall = await this.waterfallRepo.findOne({
      where: { workspaceId },
      order: { periodEnd: 'DESC' },
    });

    const openingARR = previousWaterfall ? Number(previousWaterfall.closingARR) : 0;
    const closingARR = openingARR + newBookingsARR + expansionRevenue - contractionBookings - churnedRevenue;

    const grossRetention = openingARR > 0 ? ((openingARR - churnedRevenue - contractionBookings) / openingARR) * 100 : 100;
    const netRetention = openingARR > 0 ? ((openingARR + expansionRevenue - contractionBookings - churnedRevenue) / openingARR) * 100 : 100;

    const uniqueAccounts = new Set(bookings.map((b) => b.accountId));
    const newAccounts = new Set(periodBookings.filter((b) => b.type === BookingType.NEW).map((b) => b.accountId));
    const churnedAccounts = new Set(periodChurns.map((c) => c.accountId));

    let waterfall = await this.waterfallRepo.findOne({
      where: { workspaceId, periodStart, periodEnd },
    });

    if (!waterfall) {
      waterfall = this.waterfallRepo.create({ workspaceId });
    }

    waterfall.period = period;
    waterfall.periodStart = periodStart;
    waterfall.periodEnd = periodEnd;
    waterfall.openingARR = openingARR;
    waterfall.newBookings = newBookingsARR;
    waterfall.expansionRevenue = expansionRevenue;
    waterfall.contractionRevenue = contractionBookings;
    waterfall.churnedRevenue = churnedRevenue;
    waterfall.closingARR = closingARR;
    waterfall.netRevenueRetention = Math.round(netRetention * 10) / 10;
    waterfall.grossRevenueRetention = Math.round(grossRetention * 10) / 10;
    waterfall.totalAccounts = uniqueAccounts.size;
    waterfall.newAccounts = newAccounts.size;
    waterfall.churnedAccounts = churnedAccounts.size;

    this.logger.log(`Waterfall calculated: Opening ${openingARR} -> Closing ${closingARR} (NRR: ${waterfall.netRevenueRetention}%)`);
    return this.waterfallRepo.save(waterfall);
  }

  async addBooking(workspaceId: string, data: Partial<BookingEntryEntity>): Promise<BookingEntryEntity> {
    return this.bookingRepo.save(this.bookingRepo.create({ workspaceId, ...data }));
  }

  async recordChurn(workspaceId: string, data: Partial<ChurnEntryEntity>): Promise<ChurnEntryEntity> {
    this.logger.warn(`Churn recorded: account ${data.accountId}, lost ARR: ${data.lostARR}`);
    return this.churnRepo.save(this.churnRepo.create({ workspaceId, ...data }));
  }

  async recordExpansion(workspaceId: string, data: Partial<ExpansionEntryEntity>): Promise<ExpansionEntryEntity> {
    return this.expansionRepo.save(this.expansionRepo.create({ workspaceId, ...data }));
  }

  async getARRBreakdown(workspaceId: string): Promise<{
    currentARR: number; newARR: number; expansionARR: number; churnedARR: number;
    netNewARR: number; nrr: number; grr: number;
  }> {
    const latestWaterfall = await this.waterfallRepo.findOne({
      where: { workspaceId },
      order: { periodEnd: 'DESC' },
    });

    if (!latestWaterfall) {
      return { currentARR: 0, newARR: 0, expansionARR: 0, churnedARR: 0, netNewARR: 0, nrr: 100, grr: 100 };
    }

    return {
      currentARR: Number(latestWaterfall.closingARR),
      newARR: Number(latestWaterfall.newBookings),
      expansionARR: Number(latestWaterfall.expansionRevenue),
      churnedARR: Number(latestWaterfall.churnedRevenue),
      netNewARR: Number(latestWaterfall.newBookings) + Number(latestWaterfall.expansionRevenue) - Number(latestWaterfall.churnedRevenue),
      nrr: latestWaterfall.netRevenueRetention,
      grr: latestWaterfall.grossRevenueRetention,
    };
  }

  async getNetRevenueRetention(workspaceId: string): Promise<Array<{
    period: string; nrr: number; grr: number; closingARR: number;
  }>> {
    const waterfalls = await this.waterfallRepo.find({
      where: { workspaceId },
      order: { periodStart: 'ASC' },
    });

    return waterfalls.map((w) => ({
      period: `${new Date(w.periodStart).toISOString().split('T')[0]} to ${new Date(w.periodEnd).toISOString().split('T')[0]}`,
      nrr: w.netRevenueRetention,
      grr: w.grossRevenueRetention,
      closingARR: Number(w.closingARR),
    }));
  }

  async getRevenueBySegment(workspaceId: string): Promise<Array<{
    segment: string; totalARR: number; accountCount: number; avgDealSize: number; churnRate: number;
  }>> {
    const bookings = await this.bookingRepo.find({ where: { workspaceId } });
    const churns = await this.churnRepo.find({ where: { workspaceId } });

    const segmentMap: Record<string, { arr: number; accounts: Set<string>; churned: number }> = {};

    for (const booking of bookings) {
      const seg = booking.segment ?? 'unassigned';
      if (!segmentMap[seg]) segmentMap[seg] = { arr: 0, accounts: new Set(), churned: 0 };
      segmentMap[seg].arr += Number(booking.arrImpact);
      segmentMap[seg].accounts.add(booking.accountId);
    }

    for (const churn of churns) {
      const seg = churn.segment ?? 'unassigned';
      if (!segmentMap[seg]) segmentMap[seg] = { arr: 0, accounts: new Set(), churned: 0 };
      segmentMap[seg].churned++;
    }

    return Object.entries(segmentMap).map(([segment, data]) => ({
      segment,
      totalARR: Math.round(data.arr),
      accountCount: data.accounts.size,
      avgDealSize: data.accounts.size > 0 ? Math.round(data.arr / data.accounts.size) : 0,
      churnRate: data.accounts.size > 0 ? Math.round((data.churned / data.accounts.size) * 100) : 0,
    }));
  }
}
