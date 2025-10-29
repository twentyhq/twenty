import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { useEffect, type ReactNode } from 'react';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';

import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

const StyledContainer = styled.div`
  height: 200px;
  width: 300px;
`;

const StyledMockContent = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: center;
`;

const EditModeWrapper = ({
  children,
  isInEditMode,
}: {
  children: ReactNode;
  isInEditMode: boolean;
}) => {
  const setIsPageLayoutInEditMode = useSetRecoilComponentState(
    isPageLayoutInEditModeComponentState,
  );

  useEffect(() => {
    setIsPageLayoutInEditMode(isInEditMode);
  }, [isInEditMode, setIsPageLayoutInEditMode]);

  return <>{children}</>;
};

const meta: Meta<typeof WidgetCard> = {
  title: 'Modules/PageLayout/Widgets/WidgetCard',
  component: WidgetCard,
};

export default meta;
type Story = StoryObj<typeof WidgetCard>;

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <PageLayoutTestWrapper>
          <EditModeWrapper isInEditMode={true}>
            <StyledContainer>
              <Story />
            </StyledContainer>
          </EditModeWrapper>
        </PageLayoutTestWrapper>
      );
    },
    I18nFrontDecorator,
  ],
  parameters: {
    pseudo: { hover: false },
  },
  args: {
    widgetCardContext: 'dashboard',
    isEditing: false,
    isDragging: false,
  },
  render: (args) => (
    <WidgetCard
      widgetCardContext={args.widgetCardContext}
      isEditing={args.isEditing}
      isDragging={args.isDragging}
    >
      <WidgetCardHeader
        isInEditMode={true}
        onRemove={() => {}}
        title="Widget name"
      />
      <WidgetCardContent widgetCardContext={args.widgetCardContext}>
        <StyledMockContent>Widget</StyledMockContent>
      </WidgetCardContent>
    </WidgetCard>
  ),
};

export const Catalog: CatalogStory<Story, typeof WidgetCard> = {
  decorators: [
    (Story) => {
      return (
        <StyledContainer>
          <Story />
        </StyledContainer>
      );
    },
    CatalogDecorator,
    I18nFrontDecorator,
  ],
  parameters: {
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
        {
          name: 'contextVariant',
          values: [
            'Record Page - Default',
            'Record Page - Restriction',
            'Dashboard - Default',
            'Dashboard - Restriction',
          ],
          props: (contextName: string) => {
            const widgetCardContext = contextName.includes('Record')
              ? 'recordPage'
              : 'dashboard';
            const hasRestriction = contextName.includes('Restriction');

            return {
              widgetCardContext,
              contextVariant: contextName,
              hasRestriction,
            };
          },
        },
        {
          name: 'state',
          values: ['Default', 'Hover', 'Selected', 'Dragging', 'Read Mode'],
          props: (state: string) => {
            const stateProps: {
              className?: string;
              isDragging?: boolean;
              isEditing?: boolean;
            } = {};

            switch (state) {
              case 'Hover':
                stateProps.className = 'hover';
                break;
              case 'Selected':
                stateProps.isEditing = true;
                break;
              case 'Dragging':
                stateProps.isDragging = true;
                break;
              case 'Read Mode':
                stateProps.className = 'read-mode';
                break;
            }

            return { ...stateProps, state };
          },
        },
      ],
    },
  },
  render: (args: any) => {
    const isReadMode = args.state === 'Read Mode';
    const widgetCardContext = args.widgetCardContext || 'dashboard';
    const hasRestriction = args.hasRestriction || false;

    return (
      <PageLayoutTestWrapper>
        <EditModeWrapper isInEditMode={!isReadMode}>
          <WidgetCard
            className={args.className}
            isDragging={args.isDragging ?? false}
            isEditing={args.isEditing ?? false}
            widgetCardContext={widgetCardContext}
          >
            <WidgetCardHeader
              forbiddenDisplay={
                hasRestriction ? <ForbiddenFieldDisplay /> : undefined
              }
              isInEditMode={!isReadMode}
              onRemove={!isReadMode ? () => {} : undefined}
              title="Widget name"
            />
            <WidgetCardContent widgetCardContext={widgetCardContext}>
              <StyledMockContent>Widget</StyledMockContent>
            </WidgetCardContent>
          </WidgetCard>
        </EditModeWrapper>
      </PageLayoutTestWrapper>
    );
  },
};
