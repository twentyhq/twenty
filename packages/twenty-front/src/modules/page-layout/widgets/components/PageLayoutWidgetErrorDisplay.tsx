import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const StyledForbiddenContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type PageLayoutWidgetErrorDisplayProps = {
  widgetId: string;
  error?: unknown;
};

export const PageLayoutWidgetErrorDisplay = ({
  widgetId,
  error,
}: PageLayoutWidgetErrorDisplayProps) => {
  if (isGraphqlErrorOfType(error, 'FORBIDDEN')) {
    return (
      <StyledForbiddenContainer>
        <PageLayoutWidgetForbiddenDisplay
          widgetId={widgetId}
          restriction={{ type: null }}
        />
      </StyledForbiddenContainer>
    );
  }

  return (
    <PageLayoutWidgetStatusDisplay
      tooltipId={`widget-error-tooltip-${widgetId}`}
      text={t`Error`}
      tooltipContent={t`An error occurred while loading this widget.`}
    />
  );
};
