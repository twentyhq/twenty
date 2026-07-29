import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';

describe('resolveOpenRecordIn', () => {
  it('opens in the side panel when the view asks for it and it can be displayed', () => {
    expect(
      resolveOpenRecordIn({
        openRecordInViewSetting: ViewOpenRecordIn.SIDE_PANEL,
        objectNameSingular: 'company',
        canDisplaySidePanel: true,
      }),
    ).toBe(ViewOpenRecordIn.SIDE_PANEL);
  });

  it('falls back to the record page when there is no room for a side panel', () => {
    expect(
      resolveOpenRecordIn({
        openRecordInViewSetting: ViewOpenRecordIn.SIDE_PANEL,
        objectNameSingular: 'company',
        canDisplaySidePanel: false,
      }),
    ).toBe(ViewOpenRecordIn.RECORD_PAGE);
  });

  it('falls back to the record page for objects without a side panel', () => {
    expect(
      resolveOpenRecordIn({
        openRecordInViewSetting: ViewOpenRecordIn.SIDE_PANEL,
        objectNameSingular: 'workflow',
        canDisplaySidePanel: true,
      }),
    ).toBe(ViewOpenRecordIn.RECORD_PAGE);
  });

  it('keeps the record page when the view asks for it', () => {
    expect(
      resolveOpenRecordIn({
        openRecordInViewSetting: ViewOpenRecordIn.RECORD_PAGE,
        objectNameSingular: 'company',
        canDisplaySidePanel: true,
      }),
    ).toBe(ViewOpenRecordIn.RECORD_PAGE);
  });
});
