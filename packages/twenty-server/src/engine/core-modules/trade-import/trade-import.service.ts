import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PurchaseOrderEntity, ShipmentEntity, CustomsEntryEntity, LandedCostEntity,
  PurchaseOrderStatus, ShipmentStatus,
} from './trade-import.entity';

@Injectable()
export class TradeImportService {
  constructor(
    @InjectRepository(PurchaseOrderEntity) private readonly poRepo: Repository<PurchaseOrderEntity>,
    @InjectRepository(ShipmentEntity) private readonly shipmentRepo: Repository<ShipmentEntity>,
    @InjectRepository(CustomsEntryEntity) private readonly customsRepo: Repository<CustomsEntryEntity>,
    @InjectRepository(LandedCostEntity) private readonly landedCostRepo: Repository<LandedCostEntity>,
  ) {}

  // --- PURCHASE ORDERS ---
  async createPO(workspaceId: string, data: Partial<PurchaseOrderEntity>): Promise<PurchaseOrderEntity> {
    const count = await this.poRepo.count({ where: { workspaceId } });
    const poNumber = `PO-${String(count + 1).padStart(6, '0')}`;
    return this.poRepo.save(this.poRepo.create({ workspaceId, poNumber, ...data }));
  }

  async approvePO(poId: string, approverId: string): Promise<PurchaseOrderEntity> {
    const po = await this.findPOOrFail(poId);
    po.status = PurchaseOrderStatus.CONFIRMED;
    po.approverId = approverId;
    return this.poRepo.save(po);
  }

  // --- SHIPMENTS ---
  async createShipment(workspaceId: string, data: Partial<ShipmentEntity>): Promise<ShipmentEntity> {
    const shipment = await this.shipmentRepo.save(this.shipmentRepo.create({ workspaceId, ...data }));
    if (data.purchaseOrderId) {
      await this.poRepo.update(data.purchaseOrderId, { status: PurchaseOrderStatus.IN_TRANSIT });
    }
    return shipment;
  }

  async updateShipmentStatus(shipmentId: string, status: ShipmentStatus): Promise<ShipmentEntity> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException(`Shipment ${shipmentId} not found`);
    shipment.status = status;
    if (status === ShipmentStatus.DELIVERED) shipment.actualArrival = new Date();
    return this.shipmentRepo.save(shipment);
  }

  async getDelayedShipments(workspaceId: string): Promise<ShipmentEntity[]> {
    return this.shipmentRepo
      .createQueryBuilder('s')
      .where('s.workspaceId = :workspaceId', { workspaceId })
      .andWhere('s.eta < :now', { now: new Date() })
      .andWhere('s.status NOT IN (:...final)', { final: [ShipmentStatus.DELIVERED, ShipmentStatus.CLEARED] })
      .getMany();
  }

  // --- CUSTOMS ---
  async createCustomsEntry(workspaceId: string, data: Partial<CustomsEntryEntity>): Promise<CustomsEntryEntity> {
    return this.customsRepo.save(this.customsRepo.create({ workspaceId, ...data }));
  }

  async applyFTA(customsEntryId: string, ftaName: string, savingsPercent: number): Promise<CustomsEntryEntity> {
    const entry = await this.customsRepo.findOne({ where: { id: customsEntryId } });
    if (!entry) throw new NotFoundException(`Customs entry ${customsEntryId} not found`);
    entry.ftaApplied = ftaName;
    entry.ftaSavingsPercent = savingsPercent;
    entry.dutyAmount = Number(entry.dutyAmount) * (1 - savingsPercent / 100);
    return this.customsRepo.save(entry);
  }

  async getDocumentChecklist(customsEntryId: string): Promise<Array<{ name: string; required: boolean; uploaded: boolean }>> {
    const entry = await this.customsRepo.findOne({ where: { id: customsEntryId } });
    return entry?.documentChecklist ?? [];
  }

  // --- LANDED COST ---
  async calculateLandedCost(
    workspaceId: string,
    purchaseOrderId: string,
    productId: string,
    data: {
      productValue: number;
      quantity: number;
      freight?: number;
      insurance?: number;
      duties?: number;
      vat?: number;
      agentFees?: number;
      otherCosts?: number;
    },
  ): Promise<LandedCostEntity> {
    const totalLandedCost =
      data.productValue + (data.freight ?? 0) + (data.insurance ?? 0) +
      (data.duties ?? 0) + (data.vat ?? 0) + (data.agentFees ?? 0) + (data.otherCosts ?? 0);

    return this.landedCostRepo.save(this.landedCostRepo.create({
      workspaceId, purchaseOrderId, productId,
      ...data,
      totalLandedCost,
      unitLandedCost: totalLandedCost / data.quantity,
    }));
  }

  // --- ANALYTICS ---
  async getTradeAnalytics(workspaceId: string): Promise<{
    totalPOs: number;
    inTransit: number;
    avgTransitDays: number;
    totalLandedCost: number;
    totalDutiesPaid: number;
  }> {
    const pos = await this.poRepo.find({ where: { workspaceId } });
    const shipments = await this.shipmentRepo.find({ where: { workspaceId } });
    const landed = await this.landedCostRepo.find({ where: { workspaceId } });

    const delivered = shipments.filter((s) => s.actualArrival && s.etd);
    const avgTransit = delivered.length
      ? delivered.reduce((s, sh) => s + (new Date(sh.actualArrival).getTime() - new Date(sh.etd).getTime()) / 86_400_000, 0) / delivered.length
      : 0;

    return {
      totalPOs: pos.length,
      inTransit: shipments.filter((s) => s.status === ShipmentStatus.IN_TRANSIT).length,
      avgTransitDays: Math.round(avgTransit),
      totalLandedCost: landed.reduce((s, l) => s + Number(l.totalLandedCost), 0),
      totalDutiesPaid: landed.reduce((s, l) => s + Number(l.duties), 0),
    };
  }

  // --- OCR DOCUMENT PROCESSING ---
  async processDocumentOCR(workspaceId: string, shipmentId: string, documentType: string, fileContent: string): Promise<Record<string, string>> {
    // Extract fields from document using pattern matching (production: Google Vision/AWS Textract)
    const extracted: Record<string, string> = {};
    const patterns: Record<string, RegExp> = {
      blNumber: /B\/L\s*(?:No|Number|#)?[:\s]*([A-Z0-9]+)/i,
      invoiceNumber: /Invoice\s*(?:No|Number|#)?[:\s]*([A-Z0-9-]+)/i,
      totalAmount: /Total[:\s]*\$?\s*([\d,.]+)/i,
      shipper: /Shipper[:\s]*(.+?)(?:\n|$)/i,
      consignee: /Consignee[:\s]*(.+?)(?:\n|$)/i,
      portOfLoading: /Port\s*of\s*Loading[:\s]*(.+?)(?:\n|$)/i,
      portOfDischarge: /Port\s*of\s*Discharge[:\s]*(.+?)(?:\n|$)/i,
      vesselName: /Vessel[:\s]*(.+?)(?:\n|$)/i,
      containerNumber: /Container\s*(?:No|Number)?[:\s]*([A-Z]{4}\d{7})/i,
      weight: /(?:Gross\s*)?Weight[:\s]*([\d,.]+)\s*(?:kg|KG)/i,
    };

    for (const [field, regex] of Object.entries(patterns)) {
      const match = fileContent.match(regex);
      if (match) extracted[field] = match[1].trim();
    }

    // Update customs entry checklist
    const customs = await this.customsRepo.findOne({ where: { shipmentId } });
    if (customs?.documentChecklist) {
      const checklist = customs.documentChecklist;
      const idx = checklist.findIndex((d) => d.name.toLowerCase().includes(documentType.toLowerCase()));
      if (idx >= 0) { checklist[idx].uploaded = true; customs.documentChecklist = checklist; await this.customsRepo.save(customs); }
    }

    return extracted;
  }

  // --- CARBON FOOTPRINT TRACKING ---
  async calculateCarbonFootprint(shipmentId: string): Promise<{ carbonKg: number; method: string; distanceKm: number }> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException(`Shipment ${shipmentId} not found`);

    // Emission factors (kg CO2 per ton-km)
    const factors: Record<string, number> = {
      sea: 0.016, air: 0.602, road: 0.062, rail: 0.022,
    };

    const mode = shipment.carrier?.toLowerCase().includes('air') ? 'air'
      : shipment.carrier?.toLowerCase().includes('rail') ? 'rail'
        : shipment.carrier?.toLowerCase().includes('truck') ? 'road' : 'sea';

    // Estimate distance from port coordinates (simplified)
    const distanceKm = this.estimateRouteDistance(shipment.portOfOrigin ?? '', shipment.portOfDestination ?? '');

    // Get cargo weight from PO
    const po = await this.poRepo.findOne({ where: { id: shipment.purchaseOrderId } });
    const weightTons = po?.lineItems?.reduce((s, i) => s + i.quantity * 0.01, 0) ?? 1;

    const carbonKg = Math.round(distanceKm * weightTons * (factors[mode] ?? factors.sea) * 100) / 100;

    shipment.carbonKg = carbonKg;
    await this.shipmentRepo.save(shipment);

    return { carbonKg, method: mode, distanceKm };
  }

  async getCarbonReport(workspaceId: string): Promise<{
    totalCarbonKg: number; avgPerShipment: number;
    byMode: Record<string, number>; byRoute: Array<{ route: string; carbonKg: number }>;
  }> {
    const shipments = await this.shipmentRepo.find({ where: { workspaceId } });
    const withCarbon = shipments.filter((s) => s.carbonKg);
    const totalCarbonKg = withCarbon.reduce((s, sh) => s + (sh.carbonKg ?? 0), 0);

    const byRoute: Record<string, number> = {};
    for (const s of withCarbon) {
      const route = `${s.portOfOrigin ?? '?'} → ${s.portOfDestination ?? '?'}`;
      byRoute[route] = (byRoute[route] ?? 0) + (s.carbonKg ?? 0);
    }

    return {
      totalCarbonKg: Math.round(totalCarbonKg),
      avgPerShipment: withCarbon.length ? Math.round(totalCarbonKg / withCarbon.length) : 0,
      byMode: { sea: 0, air: 0, road: 0 },
      byRoute: Object.entries(byRoute).map(([route, carbonKg]) => ({ route, carbonKg: Math.round(carbonKg) })),
    };
  }

  // --- SUPPLIER PORTAL ---
  async getSupplierPOView(workspaceId: string, supplierId: string): Promise<PurchaseOrderEntity[]> {
    return this.poRepo.find({ where: { workspaceId, supplierId }, order: { createdAt: 'DESC' } });
  }

  async supplierConfirmPO(poId: string, estimatedShipDate: Date): Promise<PurchaseOrderEntity> {
    const po = await this.findPOOrFail(poId);
    po.status = PurchaseOrderStatus.CONFIRMED;
    po.expectedDeliveryDate = estimatedShipDate;
    return this.poRepo.save(po);
  }

  async supplierUploadDocument(workspaceId: string, poId: string, documentName: string, fileId: string): Promise<PurchaseOrderEntity> {
    const po = await this.findPOOrFail(poId);
    const docs = po.documentIds ?? [];
    docs.push(fileId);
    po.documentIds = docs;
    return this.poRepo.save(po);
  }

  private estimateRouteDistance(origin: string, destination: string): number {
    // Simplified distance estimation based on major trade routes
    const routes: Record<string, number> = {
      'Shanghai-Buenaventura': 16500, 'Shenzhen-Buenaventura': 16200,
      'Shanghai-Cartagena': 16800, 'Miami-Cartagena': 1800,
      'Rotterdam-Cartagena': 8500, 'Hamburg-Buenaventura': 9200,
    };
    const key = `${origin}-${destination}`;
    return routes[key] ?? 10000;
  }

  private async findPOOrFail(poId: string): Promise<PurchaseOrderEntity> {
    const po = await this.poRepo.findOne({ where: { id: poId } });
    if (!po) throw new NotFoundException(`PO ${poId} not found`);
    return po;
  }
}
