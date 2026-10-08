import { FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH } from '@/constants/FrontComponentStorageMaxKeyLength';
import { FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH } from '@/constants/FrontComponentStorageMaxTotalLength';
import { FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentStorageMaxValueLength';
import { getFrontComponentStorageViolationMessage } from '../getFrontComponentStorageViolationMessage';

describe('getFrontComponentStorageViolationMessage', () => {
  it('should return null for an entry that fits', () => {
    expect(
      getFrontComponentStorageViolationMessage({
        key: 'theme',
        serializedValue: '"dark"',
        otherEntriesTotalLength: 0,
      }),
    ).toBeNull();
  });

  it('should reject a key longer than the limit', () => {
    expect(
      getFrontComponentStorageViolationMessage({
        key: 'k'.repeat(FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH + 1),
        serializedValue: '"dark"',
        otherEntriesTotalLength: 0,
      }),
    ).toContain('Storage keys cannot exceed');
  });

  it('should reject a value longer than the limit', () => {
    expect(
      getFrontComponentStorageViolationMessage({
        key: 'draft',
        serializedValue: 'v'.repeat(
          FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH + 1,
        ),
        otherEntriesTotalLength: 0,
      }),
    ).toContain('Storage values cannot exceed');
  });

  it('should count the key length toward the total quota', () => {
    expect(
      getFrontComponentStorageViolationMessage({
        key: 'a',
        serializedValue: 'v',
        otherEntriesTotalLength: FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH - 2,
      }),
    ).toBeNull();

    expect(
      getFrontComponentStorageViolationMessage({
        key: 'a',
        serializedValue: 'v',
        otherEntriesTotalLength: FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH - 1,
      }),
    ).toContain('Storage quota');
  });
});
