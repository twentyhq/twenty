import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledListItem = styled.div<{
  noHorizontalPadding?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[10]};
  justify-content: space-between;
  padding-left: ${({ noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : themeCssVariables.spacing[3]};
  padding-right: ${({ noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : themeCssVariables.spacing[2]};

  .displayOnHover {
    opacity: 0;
    pointer-events: none;
    transition: opacity
      calc(${themeCssVariables.animation.duration.instant} * 1s) ease;
  }

  &:hover .displayOnHover,
  &:focus-within .displayOnHover,
  &:has([data-popup-open]) .displayOnHover {
    opacity: 1;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .displayOnHover {
      transition: none;
    }
  }
`;

type RecordDetailRecordsListItemContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const RecordDetailRecordsListItemContainer = ({
  children,
  className,
}: RecordDetailRecordsListItemContainerProps) => {
  const layoutRenderingContext = useLayoutRenderingContext();

  const isInRecordPageLayout =
    layoutRenderingContext?.layoutType === PageLayoutType.RECORD_PAGE;

  return (
    <StyledListItem
      className={className}
      noHorizontalPadding={isInRecordPageLayout}
    >
      {children}
    </StyledListItem>
  );
};
