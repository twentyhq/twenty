import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { useWidgetActions } from '@/page-layout/widgets/hooks/useWidgetActions';
import { useWidgetRendererState } from '@/page-layout/widgets/hooks/useWidgetRendererState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  FeatureFlagKey,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

const StyledEditingWidgetWrapper = styled.div`
  padding: ${themeCssVariables.spacing[2]};
`;

type RecordPageWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordPageWidgetRenderer = ({
  widget,
}: RecordPageWidgetRendererProps) => {
  const state = useWidgetRendererState(widget);

  const isRecordPageGlobalEditionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
  );

  const isRecordPageLayout =
    state.currentPageLayout.type === PageLayoutType.RECORD_PAGE;

  const isReorderEnabled =
    !isRecordPageLayout ||
    (isRecordPageLayout && isRecordPageGlobalEditionEnabled);

  const isDeletingWidgetEnabled =
    !isRecordPageLayout ||
    (isRecordPageLayout && isRecordPageGlobalEditionEnabled);

  const isWidgetEditable =
    state.isPageLayoutInEditMode &&
    (!isRecordPageLayout ||
      (isRecordPageLayout && isRecordPageGlobalEditionEnabled) ||
      widget.type === WidgetType.FIELDS ||
      widget.type === WidgetType.FIELD);

  const actions = useWidgetActions({ widget });

  // TODO: remove once all record page layouts widgets use the editable contain in edit mode
  const shouldWrapWithEditingWrapper =
    isWidgetEditable &&
    state.variant === 'side-column' &&
    !isRecordPageGlobalEditionEnabled;

  const isCanvasVariant = state.variant === 'canvas';

  const shell = (
    <WidgetCardShell
      widget={widget}
      variant={state.variant}
      isEditable={isWidgetEditable}
      isEditing={state.isEditing}
      isDragging={state.isDragging}
      isResizing={state.isResizing}
      isLastWidget={state.isLastWidget}
      showHeader={state.showHeader}
      hasAccess={state.hasAccess}
      restriction={state.restriction}
      actions={actions}
      isInVerticalListTab={state.isInVerticalListTab}
      isMobile={state.isMobile}
      isReorderEnabled={isReorderEnabled}
      isDeletingWidgetEnabled={isDeletingWidgetEnabled}
      onClick={isWidgetEditable ? state.handleClick : undefined}
      onRemove={state.handleRemove}
      onMouseEnter={isCanvasVariant ? undefined : state.handleMouseEnter}
      onMouseLeave={isCanvasVariant ? undefined : state.handleMouseLeave}
    />
  );

  if (shouldWrapWithEditingWrapper) {
    return <StyledEditingWidgetWrapper>{shell}</StyledEditingWidgetWrapper>;
  }

  return shell;
};
