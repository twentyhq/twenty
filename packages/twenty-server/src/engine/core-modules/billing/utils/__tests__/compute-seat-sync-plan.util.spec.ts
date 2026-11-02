/* @license Enterprise */

import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { computeSeatSyncPlan } from 'src/engine/core-modules/billing/utils/compute-seat-sync-plan.util';

const CURRENT_PERIOD_START = new Date('2026-11-01T00:00:00.000Z');
const NOW = new Date('2026-11-15T00:00:00.000Z');
const CURRENT_PERIOD_END = new Date('2026-12-01T00:00:00.000Z');

const committedSeats = (
  seats: number,
  overrides: Partial<SeatBillingArrangement> = {},
): SeatBillingArrangement => ({
  type: BillingArrangementType.COMMITTED_SEATS,
  seats,
  seatCapMode: BillingArrangementSeatCapMode.SOFT,
  startsAt: new Date('2026-10-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
  ...overrides,
});

const freeSeats = (
  seats: number,
  overrides: Partial<SeatBillingArrangement> = {},
): SeatBillingArrangement => ({
  type: BillingArrangementType.FREE_SEATS,
  seats,
  seatCapMode: null,
  startsAt: new Date('2026-10-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
  ...overrides,
});

const computePlan = ({
  memberCount,
  currentSeats,
  seatArrangements,
  isTrialing = false,
}: {
  memberCount: number;
  currentSeats: number;
  seatArrangements: SeatBillingArrangement[];
  isTrialing?: boolean;
}) =>
  computeSeatSyncPlan({
    memberCount,
    currentSeats,
    seatArrangements,
    now: NOW,
    currentPeriodStart: CURRENT_PERIOD_START,
    currentPeriodEnd: CURRENT_PERIOD_END,
    isTrialing,
  });

describe('computeSeatSyncPlan', () => {
  it('follows the member count right away without arrangements', () => {
    expect(
      computePlan({ memberCount: 8, currentSeats: 10, seatArrangements: [] }),
    ).toEqual({ currentPeriodSeats: 8, nextPeriodSeats: null });
  });

  it('ignores arrangements that ended before the current period', () => {
    expect(
      computePlan({
        memberCount: 8,
        currentSeats: 20,
        seatArrangements: [
          committedSeats(20, { endsAt: new Date('2026-10-20T00:00:00.000Z') }),
        ],
      }),
    ).toEqual({ currentPeriodSeats: 8, nextPeriodSeats: null });
  });

  it('bills a member joining above the commitment right away', () => {
    expect(
      computePlan({
        memberCount: 21,
        currentSeats: 20,
        seatArrangements: [committedSeats(20)],
      }),
    ).toEqual({ currentPeriodSeats: 21, nextPeriodSeats: 21 });
  });

  it('keeps the commitment when members leave', () => {
    expect(
      computePlan({
        memberCount: 12,
        currentSeats: 20,
        seatArrangements: [committedSeats(20)],
      }),
    ).toEqual({ currentPeriodSeats: 20, nextPeriodSeats: 20 });
  });

  it('waits for the renewal to drop a seat when a member leaves above the commitment', () => {
    expect(
      computePlan({
        memberCount: 22,
        currentSeats: 25,
        seatArrangements: [committedSeats(20)],
      }),
    ).toEqual({ currentPeriodSeats: 25, nextPeriodSeats: 22 });
  });

  it('bills a new commitment above the members right away', () => {
    expect(
      computePlan({
        memberCount: 12,
        currentSeats: 12,
        seatArrangements: [committedSeats(20, { startsAt: NOW })],
      }),
    ).toEqual({ currentPeriodSeats: 20, nextPeriodSeats: 20 });
  });

  it('waits for the renewal to apply new free seats', () => {
    expect(
      computePlan({
        memberCount: 10,
        currentSeats: 10,
        seatArrangements: [freeSeats(3, { startsAt: NOW })],
      }),
    ).toEqual({ currentPeriodSeats: 10, nextPeriodSeats: 7 });
  });

  it('schedules zero seats when every member is free', () => {
    expect(
      computePlan({
        memberCount: 2,
        currentSeats: 2,
        seatArrangements: [freeSeats(3)],
      }),
    ).toEqual({ currentPeriodSeats: 2, nextPeriodSeats: 0 });
  });

  it('keeps a commitment ended early until the renewal', () => {
    expect(
      computePlan({
        memberCount: 12,
        currentSeats: 20,
        seatArrangements: [committedSeats(20, { revokedAt: NOW })],
      }),
    ).toEqual({ currentPeriodSeats: 20, nextPeriodSeats: 12 });
  });

  it('keeps free seats that ended mid-period until the renewal', () => {
    expect(
      computePlan({
        memberCount: 10,
        currentSeats: 7,
        seatArrangements: [
          freeSeats(3, { endsAt: new Date('2026-11-10T00:00:00.000Z') }),
        ],
      }),
    ).toEqual({ currentPeriodSeats: 7, nextPeriodSeats: 10 });
  });

  it('drops a commitment that ends at the renewal from the next period', () => {
    expect(
      computePlan({
        memberCount: 12,
        currentSeats: 20,
        seatArrangements: [committedSeats(20, { endsAt: CURRENT_PERIOD_END })],
      }),
    ).toEqual({ currentPeriodSeats: 20, nextPeriodSeats: 12 });
  });

  it('raises the commitment right away and lowers it at the renewal', () => {
    const replacedAt = NOW;

    expect(
      computePlan({
        memberCount: 12,
        currentSeats: 20,
        seatArrangements: [
          committedSeats(20, { revokedAt: replacedAt }),
          committedSeats(30, { startsAt: replacedAt }),
        ],
      }),
    ).toEqual({ currentPeriodSeats: 30, nextPeriodSeats: 30 });

    expect(
      computePlan({
        memberCount: 12,
        currentSeats: 30,
        seatArrangements: [
          committedSeats(30, { revokedAt: replacedAt }),
          committedSeats(20, { startsAt: replacedAt }),
        ],
      }),
    ).toEqual({ currentPeriodSeats: 30, nextPeriodSeats: 20 });
  });

  it('applies arrangements right away during a trial', () => {
    expect(
      computePlan({
        memberCount: 10,
        currentSeats: 10,
        seatArrangements: [freeSeats(3, { startsAt: NOW })],
        isTrialing: true,
      }),
    ).toEqual({ currentPeriodSeats: 7, nextPeriodSeats: null });
  });

  it('drops ended arrangements right away during a trial', () => {
    expect(
      computePlan({
        memberCount: 12,
        currentSeats: 20,
        seatArrangements: [committedSeats(20, { revokedAt: NOW })],
        isTrialing: true,
      }),
    ).toEqual({ currentPeriodSeats: 12, nextPeriodSeats: null });
  });
});
