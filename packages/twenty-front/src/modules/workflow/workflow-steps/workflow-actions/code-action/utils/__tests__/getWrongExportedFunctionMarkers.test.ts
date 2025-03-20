import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';

describe('getWrongExportedFunctionMarkers', () => {
  it('should return marker when no exported function', () => {
    const value = 'const main = async () => {}';
    const result = getWrongExportedFunctionMarkers(value);
    expect(result.length).toEqual(1);
    expect(result[0].message).toEqual(
      'An exported "main" arrow function is required.',
    );
  });

  it('should return marker when no wrong exported function', () => {
    const value = 'export const wrongMain = async () => {}';
    const result = getWrongExportedFunctionMarkers(value);
    expect(result.length).toEqual(1);
  });

  it('should return no marker when valid exported function', () => {
    const value = 'export const main = async () => {}';
    const result = getWrongExportedFunctionMarkers(value);
    expect(result.length).toEqual(0);
  });

  it('should return handle multiple spaces', () => {
    const value = 'export   const   main  = async () => {}';
    const result = getWrongExportedFunctionMarkers(value);
    expect(result.length).toEqual(0);
  });
});
