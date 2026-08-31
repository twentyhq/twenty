import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

import { SidePanelRecordPage } from '@/side-panel/pages/record-page/components/SidePanelRecordPage';

jest.mock('@/object-record/record-show/hooks/useRecordShowPage', () => ({
  useRecordShowPage: () => ({
    objectNameSingular: 'company',
    objectRecordId: '11111111-1111-4111-8111-111111111111',
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: () => null,
  }),
);

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext',
  () => ({
    useComponentInstanceStateContext: () => ({
      instanceId: 'artifact-page-id',
    }),
  }),
);

jest.mock(
  '@/object-record/components/RecordComponentInstanceContextsWrapper',
  () => ({
    RecordComponentInstanceContextsWrapper: ({
      children,
    }: {
      children: ReactNode;
    }) => children,
  }),
);

jest.mock(
  '@/object-record/record-show/components/PageLayoutRecordPageRenderer',
  () => ({
    PageLayoutRecordPageRenderer: ({
      targetRecordIdentifier,
      isInSidePanel,
    }: {
      targetRecordIdentifier: {
        id: string;
        targetObjectNameSingular: string;
      };
      isInSidePanel: boolean;
    }) => (
      <div data-testid="record-renderer">
        {targetRecordIdentifier.targetObjectNameSingular}:
        {targetRecordIdentifier.id}:{isInSidePanel ? 'side-panel' : 'main'}
      </div>
    ),
  }),
);

jest.mock(
  '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect',
  () => ({
    RecordShowPageSSESubscribeEffect: () => null,
  }),
);

describe('SidePanelRecordPage', () => {
  it('renders the record through the native side-panel renderer mode', () => {
    render(
      <SidePanelRecordPage
        objectNameSingular="company"
        recordId="11111111-1111-4111-8111-111111111111"
      />,
    );

    expect(screen.getByTestId('record-renderer')).toHaveTextContent(
      'company:11111111-1111-4111-8111-111111111111:side-panel',
    );
  });
});
