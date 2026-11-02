/* @license Enterprise */

import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { isSeatLimitReached } from 'src/engine/core-modules/billing/utils/is-seat-limit-reached.util';

const NOW = new Date('2026-11-15T00:00:00.000Z');

const committedSeats = (
  seats: number,
  overrides: Partial<SeatBillingArrangement> = {},
): SeatBillingArrangement => ({
  type: BillingArrangementType.COMMITTED_SEATS,
  seats,
  seatCapMode: BillingArrangementSeatCapMode.HARD,
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
  ...overrides,
});

const freeSeats = (seats: number): SeatBillingArrangement => ({
  type: BillingArrangementType.FREE_SEATS,
  seats,
  seatCapMode: null,
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
});

describe('isSeatLimitReached', () => {
  it('lets members join without arrangements', () => {
    expect(
      isSeatLimitReached({ memberCount: 50, seatArrangements: [], now: NOW }),
    ).toBe(false);
  });

  it('lets members join under a hard cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 19,
        seatArrangements: [committedSeats(20)],
        now: NOW,
      }),
    ).toBe(false);
  });

  it('blocks a member joining at a hard cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 20,
        seatArrangements: [committedSeats(20)],
        now: NOW,
      }),
    ).toBe(true);
  });

  it('counts free seats on top of the hard cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 22,
        seatArrangements: [committedSeats(20), freeSeats(3)],
        now: NOW,
      }),
    ).toBe(false);

    expect(
      isSeatLimitReached({
        memberCount: 23,
        seatArrangements: [committedSeats(20), freeSeats(3)],
        now: NOW,
      }),
    ).toBe(true);
  });

  it('lets members join above a soft cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 20,
        seatArrangements: [
          committedSeats(20, {
            seatCapMode: BillingArrangementSeatCapMode.SOFT,
          }),
        ],
        now: NOW,
      }),
    ).toBe(false);
  });

  it('lifts the hard cap once the commitment ends', () => {
    expect(
      isSeatLimitReached({
        memberCount: 20,
        seatArrangements: [committedSeats(20, { revokedAt: NOW })],
        now: NOW,
      }),
    ).toBe(false);
  });
});
