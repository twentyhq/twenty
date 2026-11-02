/* @license Enterprise */

import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { computeBilledSeats } from 'src/engine/core-modules/billing/utils/compute-billed-seats.util';

const committedSeats = (seats: number): SeatBillingArrangement => ({
  type: BillingArrangementType.COMMITTED_SEATS,
  seats,
  seatCapMode: BillingArrangementSeatCapMode.SOFT,
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
});

const freeSeats = (seats: number): SeatBillingArrangement => ({
  type: BillingArrangementType.FREE_SEATS,
  seats,
  seatCapMode: null,
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
});

describe('computeBilledSeats', () => {
  it('bills every member without arrangements', () => {
    expect(computeBilledSeats({ memberCount: 7, seatArrangements: [] })).toBe(
      7,
    );
  });

  it('does not bill free seats', () => {
    expect(
      computeBilledSeats({ memberCount: 7, seatArrangements: [freeSeats(3)] }),
    ).toBe(4);
  });

  it('bills zero seats when every member is free', () => {
    expect(
      computeBilledSeats({ memberCount: 2, seatArrangements: [freeSeats(3)] }),
    ).toBe(0);
  });

  it('never bills less than the commitment', () => {
    expect(
      computeBilledSeats({
        memberCount: 12,
        seatArrangements: [committedSeats(20)],
      }),
    ).toBe(20);
  });

  it('bills members above the commitment', () => {
    expect(
      computeBilledSeats({
        memberCount: 25,
        seatArrangements: [committedSeats(20)],
      }),
    ).toBe(25);
  });

  it('combines free seats with a commitment', () => {
    expect(
      computeBilledSeats({
        memberCount: 25,
        seatArrangements: [committedSeats(20), freeSeats(3)],
      }),
    ).toBe(22);
  });

  it('uses the highest commitment when two apply in the same period', () => {
    expect(
      computeBilledSeats({
        memberCount: 10,
        seatArrangements: [committedSeats(30), committedSeats(20)],
      }),
    ).toBe(30);
  });
});
