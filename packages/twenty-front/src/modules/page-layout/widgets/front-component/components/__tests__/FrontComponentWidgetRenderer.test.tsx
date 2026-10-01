import { render, screen } from '@testing-library/react';

import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FrontComponentWidgetRenderer } from '@/page-layout/widgets/front-component/components/FrontComponentWidgetRenderer';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

jest.mock('@/front-components/components/FrontComponentRenderer', () => ({
  FrontComponentRenderer: ({
    frontComponentId,
    selectedRecordIds,
    objectNameSingular,
  }: {
    frontComponentId: string;
    selectedRecordIds?: string[];
    objectNameSingular?: string;
  }) => (
    <div data-testid="front-component">
      {`${frontComponentId}:${objectNameSingular ?? 'no object'}:${selectedRecordIds?.join(',') ?? 'no records'}`}
    </div>
  ),
}));

jest.mock('@/front-components/components/FrontComponentSkeletonLoader', () => ({
  FrontComponentSkeletonLoader: () => <div data-testid="skeleton" />,
}));

const FRONT_COMPONENT_WIDGET = {
  id: 'widget-id',
  configuration: {
    __typename: 'FrontComponentConfiguration',
    configurationType: WidgetConfigurationType.FRONT_COMPONENT,
    frontComponentId: 'front-component-id',
  },
} as PageLayoutWidget;

const renderFrontComponentWidget = ({
  layoutType,
  targetRecordIdentifier,
}: {
  layoutType: PageLayoutType;
  targetRecordIdentifier?: TargetRecordIdentifier;
}) =>
  render(
    <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
      <PageLayoutContentProvider
        value={{
          tabId: 'tab-id',
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          presentation: 'stack',
        }}
      >
        <LayoutRenderingProvider value={{ targetRecordIdentifier, layoutType }}>
          <FrontComponentWidgetRenderer widget={FRONT_COMPONENT_WIDGET} />
        </LayoutRenderingProvider>
      </PageLayoutContentProvider>
    </PageLayoutEditModeProviderContext>,
  );

describe('FrontComponentWidgetRenderer', () => {
  it('hands the component the record page record and its object', async () => {
    renderFrontComponentWidget({
      layoutType: PageLayoutType.RECORD_PAGE,
      targetRecordIdentifier: {
        id: 'record-id',
        targetObjectNameSingular: 'company',
      },
    });

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'front-component-id:company:record-id',
    );
  });

  it('hands the component no object on a dashboard', async () => {
    renderFrontComponentWidget({ layoutType: PageLayoutType.DASHBOARD });

    expect(await screen.findByTestId('front-component')).toHaveTextContent(
      'front-component-id:no object:no records',
    );
  });
});
