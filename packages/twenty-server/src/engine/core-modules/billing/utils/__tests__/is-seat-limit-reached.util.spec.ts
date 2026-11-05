/* @license Enterprise */

import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type SeatBillingArrangement } from 'src/engine/core-modules/billing/types/seat-billing-arrangement.type';
import { isSeatLimitReached } from 'src/engine/core-modules/billing/utils/is-seat-limit-reached.util';

const committedSeats = ({
  seats,
  seatCapMode = BillingArrangementSeatCapMode.HARD,
}: {
  seats: number;
  seatCapMode?: BillingArrangementSeatCapMode;
}): SeatBillingArrangement => ({
  type: BillingArrangementType.COMMITTED_SEATS,
  seats,
  seatCapMode,
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

describe('isSeatLimitReached', () => {
  it('lets members join without arrangements', () => {
    expect(isSeatLimitReached({ memberCount: 50, seatArrangements: [] })).toBe(
      false,
    );
  });

  it('lets members join under a hard cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 19,
        seatArrangements: [committedSeats({ seats: 20 })],
      }),
    ).toBe(false);
  });

  it('blocks a member joining at a hard cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 20,
        seatArrangements: [committedSeats({ seats: 20 })],
      }),
    ).toBe(true);
  });

  it('counts free seats on top of the hard cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 22,
        seatArrangements: [committedSeats({ seats: 20 }), freeSeats(3)],
      }),
    ).toBe(false);

    expect(
      isSeatLimitReached({
        memberCount: 23,
        seatArrangements: [committedSeats({ seats: 20 }), freeSeats(3)],
      }),
    ).toBe(true);
  });

  it('lets members join above a soft cap', () => {
    expect(
      isSeatLimitReached({
        memberCount: 20,
        seatArrangements: [
          committedSeats({
            seats: 20,
            seatCapMode: BillingArrangementSeatCapMode.SOFT,
          }),
        ],
      }),
    ).toBe(false);
  });
});
