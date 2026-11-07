import { resolveScrollIntoViewDelta } from '@/host/scroll/utils/resolveScrollIntoViewDelta';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

const SCROLLPORT_START = 100;
const SCROLLPORT_END = 200;

const resolveDeltaInScrollport = ({
  elementStart,
  elementEnd,
  alignment,
}: {
  elementStart: number;
  elementEnd: number;
  alignment: ScrollIntoViewAlignment;
}) =>
  resolveScrollIntoViewDelta({
    elementStart,
    elementEnd,
    scrollportStart: SCROLLPORT_START,
    scrollportEnd: SCROLLPORT_END,
    alignment,
  });

describe('resolveScrollIntoViewDelta', () => {
  describe('start alignment', () => {
    it('should align the element start with the scrollport start', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 150,
          elementEnd: 170,
          alignment: 'start',
        }),
      ).toBe(50);
    });

    it('should return a negative delta when the element starts before the scrollport', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 40,
          elementEnd: 60,
          alignment: 'start',
        }),
      ).toBe(-60);
    });
  });

  describe('end alignment', () => {
    it('should align the element end with the scrollport end', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 150,
          elementEnd: 170,
          alignment: 'end',
        }),
      ).toBe(-30);
    });

    it('should return a positive delta when the element ends after the scrollport', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 230,
          elementEnd: 260,
          alignment: 'end',
        }),
      ).toBe(60);
    });
  });

  describe('center alignment', () => {
    it('should align the element center with the scrollport center', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 150,
          elementEnd: 170,
          alignment: 'center',
        }),
      ).toBe(10);
    });

    it('should center an element that is larger than the scrollport', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 0,
          elementEnd: 400,
          alignment: 'center',
        }),
      ).toBe(50);
    });
  });

  describe('nearest alignment', () => {
    it('should not scroll when the element is fully inside the scrollport', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 120,
          elementEnd: 180,
          alignment: 'nearest',
        }),
      ).toBe(0);
    });

    it('should not scroll when the element edges touch the scrollport edges', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: SCROLLPORT_START,
          elementEnd: SCROLLPORT_END,
          alignment: 'nearest',
        }),
      ).toBe(0);
    });

    it('should not scroll when the element straddles both scrollport edges', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 50,
          elementEnd: 250,
          alignment: 'nearest',
        }),
      ).toBe(0);
    });

    it('should align the start when a smaller element overflows the scrollport start', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 80,
          elementEnd: 120,
          alignment: 'nearest',
        }),
      ).toBe(-20);
    });

    it('should align the start when a smaller element is entirely before the scrollport', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 10,
          elementEnd: 30,
          alignment: 'nearest',
        }),
      ).toBe(-90);
    });

    it('should align the end when a smaller element overflows the scrollport end', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 180,
          elementEnd: 220,
          alignment: 'nearest',
        }),
      ).toBe(20);
    });

    it('should align the end when a smaller element is entirely after the scrollport', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 300,
          elementEnd: 320,
          alignment: 'nearest',
        }),
      ).toBe(120);
    });

    it('should align the end when a larger element overflows the scrollport start', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 0,
          elementEnd: 150,
          alignment: 'nearest',
        }),
      ).toBe(-50);
    });

    it('should align the start when a larger element overflows the scrollport end', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 150,
          elementEnd: 300,
          alignment: 'nearest',
        }),
      ).toBe(50);
    });

    it('should bring an element of the scrollport size fully into view when it overflows the start', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 50,
          elementEnd: 150,
          alignment: 'nearest',
        }),
      ).toBe(-50);
    });

    it('should bring an element of the scrollport size fully into view when it overflows the end', () => {
      expect(
        resolveDeltaInScrollport({
          elementStart: 150,
          elementEnd: 250,
          alignment: 'nearest',
        }),
      ).toBe(50);
    });
  });
});
