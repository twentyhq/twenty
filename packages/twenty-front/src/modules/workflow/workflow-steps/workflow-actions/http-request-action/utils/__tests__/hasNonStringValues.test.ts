import { type HttpRequestBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { hasNonStringValues } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/hasNonStringValues';

describe('hasNonStringValues', () => {
  it('should return true for empty object', () => {
    expect(hasNonStringValues({})).toBe(true);
  });

  it('should return false for object with only string values', () => {
    expect(hasNonStringValues({ key1: 'value1', key2: 'value2' })).toBe(false);
  });

  it('should return true for object with null values', () => {
    const body: HttpRequestBody = { key1: null, key2: 'value' };
    expect(hasNonStringValues(body)).toBe(true);
  });

  it('should return true for object with number values', () => {
    const body: HttpRequestBody = { key1: 'value1', key2: 123 };
    expect(hasNonStringValues(body)).toBe(true);
  });

  it('should return true for object with boolean values', () => {
    const body: HttpRequestBody = { key1: 'value1', key2: true };
    expect(hasNonStringValues(body)).toBe(true);
  });

  it('should return true for object with array values', () => {
    const body: HttpRequestBody = {
      key1: 'value1',
      key2: [1, 'two', true, null],
    };
    expect(hasNonStringValues(body)).toBe(true);
  });
});
