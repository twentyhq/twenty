import { afterEach, describe, expect, it, vi } from 'vitest';

const { openSidePanelPage, navigate } = vi.hoisted(() => ({
  openSidePanelPage: vi.fn(() => Promise.resolve()),
  navigate: vi.fn(() => Promise.resolve()),
}));

vi.mock('twenty-sdk/front-component', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/front-component')>()),
  openSidePanelPage,
  navigate,
}));

import { SidePanelPages } from 'twenty-sdk/front-component';

import { openRecord } from 'src/front-components/utils/open-record.util';

describe('openRecord', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lets the host open the record where Twenty is configured to', async () => {
    await openRecord({
      objectNameSingular: 'callRecording',
      recordId: 'call-recording-id',
    });

    expect(openSidePanelPage).toHaveBeenCalledWith({
      page: SidePanelPages.ViewRecord,
      objectNameSingular: 'callRecording',
      recordId: 'call-recording-id',
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});
