import { render } from '@testing-library/react';
import React from 'react';

import { LocalePicker } from './LocalePicker';

const mockSelect = jest.fn(() => null);

jest.mock('@/ui/input/components/Select', () => ({
  Select: (props: any) => {
    mockSelect(props);
    return null;
  },
}));

jest.mock('recoil', () => ({
  useRecoilState: () => [{ id: '1', locale: 'en' }, jest.fn()],
  useSetRecoilState: () => jest.fn(),
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: jest.fn() }),
}));

jest.mock('@/object-metadata/hooks/useRefreshObjectMetadataItems', () => ({
  useRefreshObjectMetadataItems: () => ({
    refreshObjectMetadataItems: jest.fn(),
  }),
}));

jest.mock('@/views/hooks/useRefreshAllCoreViews', () => ({
  useRefreshAllCoreViews: () => ({ refreshAllCoreViews: jest.fn() }),
}));

jest.mock('~/utils/i18n/dynamicActivate', () => ({
  dynamicActivate: jest.fn(),
}));

jest.mock('~/utils/logError', () => ({
  logError: jest.fn(),
}));

jest.mock('@lingui/react/macro', () => ({
  useLingui: () => ({
    t: (messages: TemplateStringsArray) => messages[0],
  }),
}));

jest.mock('@/ui/field/display/utils/getDateFnsLocale.util', () => ({
  getDateFnsLocale: jest.fn().mockResolvedValue(null),
}));

describe('LocalePicker', () => {
  it('passes alphabetically sorted options including Persian to Select', () => {
    render(<LocalePicker />);

    const options = mockSelect.mock.calls[0][0].options;
    const labels = options.map((o: { label: string }) => o.label);
    const sorted = [...labels].sort((a, b) => a.localeCompare(b));

    expect(labels).toEqual(sorted);
    expect(labels).toContain('Persian');
  });
});
