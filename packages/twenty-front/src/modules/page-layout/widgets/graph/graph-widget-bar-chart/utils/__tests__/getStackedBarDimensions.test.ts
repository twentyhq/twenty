import {
  getStackedBarDimensions,
  type StackedBarLayout,
} from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/getStackedBarDimensions';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computeBarPositionContext';

const createContext = (
  overrides: Partial<BarPositionContext> = {},
): BarPositionContext => ({
  isVertical: true,
  dataLength: 1,
  keysLength: 2,
  categoryStep: 10,
  categoryWidth: 80,
  outerPadding: 0,
  valueAxisLength: 100,
  valueToPixel: (value: number) => value,
  zeroPixel: 0,
  ...overrides,
});

describe('getStackedBarDimensions', () => {
  const layout: StackedBarLayout = {
    barThickness: 10,
    categoryBarCenteringOffset: 2,
    stackValueToPixel: (value) => value,
    stackRange: 1,
  };

  it('computes vertical positive bar dimensions', () => {
    const ctx = createContext({ isVertical: true });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: 30,
      positiveStackPixel: 50,
      negativeStackPixel: 50,
    });

    expect(dimensions).toEqual({
      x: 22,
      y: 20,
      width: 10,
      height: 30,
      newPositiveStackPixel: 80,
      newNegativeStackPixel: 50,
    });
  });

  it('computes vertical negative bar dimensions', () => {
    const ctx = createContext({ isVertical: true });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: -20,
      positiveStackPixel: 50,
      negativeStackPixel: 50,
    });

    expect(dimensions).toEqual({
      x: 22,
      y: 50,
      width: 10,
      height: 20,
      newPositiveStackPixel: 50,
      newNegativeStackPixel: 30,
    });
  });

  it('computes horizontal positive bar dimensions', () => {
    const ctx = createContext({ isVertical: false });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: 20,
      positiveStackPixel: 50,
      negativeStackPixel: 50,
    });

    expect(dimensions).toEqual({
      x: 50,
      y: 22,
      width: 20,
      height: 10,
      newPositiveStackPixel: 70,
      newNegativeStackPixel: 50,
    });
  });

  it('computes horizontal negative bar dimensions', () => {
    const ctx = createContext({ isVertical: false });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: -20,
      positiveStackPixel: 50,
      negativeStackPixel: 50,
    });

    expect(dimensions).toEqual({
      x: 30,
      y: 22,
      width: 20,
      height: 10,
      newPositiveStackPixel: 50,
      newNegativeStackPixel: 30,
    });
  });

  it('clamps vertical positive bar when stack exceeds axis length', () => {
    const ctx = createContext({ isVertical: true });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: 40,
      positiveStackPixel: 80,
      negativeStackPixel: 50,
    });

    expect(dimensions).toEqual({
      x: 22,
      y: 0,
      width: 10,
      height: 20,
      newPositiveStackPixel: 120,
      newNegativeStackPixel: 50,
    });
  });

  it('clamps vertical negative bar when stack goes below zero', () => {
    const ctx = createContext({ isVertical: true });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: -40,
      positiveStackPixel: 50,
      negativeStackPixel: 20,
    });

    expect(dimensions).toEqual({
      x: 22,
      y: 80,
      width: 10,
      height: 20,
      newPositiveStackPixel: 50,
      newNegativeStackPixel: -20,
    });
  });

  it('clamps horizontal positive bar when stack exceeds axis length', () => {
    const ctx = createContext({ isVertical: false });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: 40,
      positiveStackPixel: 80,
      negativeStackPixel: 50,
    });

    expect(dimensions).toEqual({
      x: 80,
      y: 22,
      width: 20,
      height: 10,
      newPositiveStackPixel: 120,
      newNegativeStackPixel: 50,
    });
  });

  it('clamps horizontal negative bar when stack goes below zero', () => {
    const ctx = createContext({ isVertical: false });

    const dimensions = getStackedBarDimensions({
      ctx,
      layout,
      categoryStart: 20,
      value: -40,
      positiveStackPixel: 50,
      negativeStackPixel: 20,
    });

    expect(dimensions).toEqual({
      x: 0,
      y: 22,
      width: 20,
      height: 10,
      newPositiveStackPixel: 50,
      newNegativeStackPixel: -20,
    });
  });
});
