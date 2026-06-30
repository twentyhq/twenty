import { computeNewExpirationDate } from '@/settings/developers/utils/computeNewExpirationDate';

jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

describe('computeNewExpirationDate', () => {
  it('should compute properly', () => {
    const expiresAt = '2023-01-10T00:00:00.000Z';
    const createdAt = '2023-01-01T00:00:00.000Z';
    const result = computeNewExpirationDate(expiresAt, createdAt);
    expect(result).toEqual('2024-01-10T00:00:00.000Z');
  });
  it('should compute properly with same values', () => {
    const expiresAt = '2023-01-01T10:00:00.000Z';
    const createdAt = '2023-01-01T10:00:00.000Z';
    const result = computeNewExpirationDate(expiresAt, createdAt);
    expect(result).toEqual('2024-01-01T00:00:00.000Z');
  });
  it('should compute properly with no expiration', () => {
    const createdAt = '2023-01-01T10:00:00.000Z';
    const result = computeNewExpirationDate(undefined, createdAt);
    expect(result).toEqual(null);
  });
});
