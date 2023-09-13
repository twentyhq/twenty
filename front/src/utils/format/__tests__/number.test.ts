import { formatNumber } from '../number';

// This tests the en-US locale by default
describe('formatNumber', () => {
  it(`Should format 123 correctly`, () => {
    expect(formatNumber(123)).toEqual('123');
  });
  it(`Should format decimal numbers correctly`, () => {
    expect(formatNumber(123.92)).toEqual('123.92');
  });
  it(`Should format large numbers correctly`, () => {
    expect(formatNumber(1234567)).toEqual('1,234,567');
  });
  it(`Should format large numbers with a decimal point correctly`, () => {
    expect(formatNumber(7654321.89)).toEqual('7,654,321.89');
  });
});
