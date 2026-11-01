import { setupI18n } from '@lingui/core';

import { getLocalizedToastProps } from '@/ui/feedback/toast/utils/getLocalizedToastProps';

const i18n = setupI18n({ locale: 'en', messages: { en: {} } });

describe('getLocalizedToastProps', () => {
  it('uses the neutral accessible name when the status is omitted', () => {
    expect(getLocalizedToastProps({ toast: {}, i18n })).toEqual({
      iconLabel: 'Alert',
      title: 'Alert',
      cancelLabel: 'Cancel',
      closeLabel: 'Close',
    });
  });

  it('preserves caller-owned labels and rich cancel content', () => {
    const cancelLabel = <strong>Stop import</strong>;

    expect(
      getLocalizedToastProps({
        toast: {
          status: 'success',
          children: <strong>Import complete</strong>,
          iconLabel: 'Completed import',
          title: 'Import details',
          cancelLabel,
          closeLabel: 'Dismiss import',
        },
        i18n,
      }),
    ).toEqual({
      iconLabel: 'Completed import',
      title: 'Import details',
      cancelLabel,
      closeLabel: 'Dismiss import',
    });
  });

  it('preserves an explicitly cleared cancel label', () => {
    expect(
      getLocalizedToastProps({ toast: { cancelLabel: null }, i18n })
        .cancelLabel,
    ).toBeNull();
  });
});
