import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledListItem = styled.div<{
  noHorizontalPadding?: boolean;
  isDropdownOpen?: boolean;
}>`
  align-items: center;
  justify-content: space-between;
  gap: ${themeCssVariables.spacing[1]};
  display: flex;
  height: ${themeCssVariables.spacing[10]};
  padding-left: ${({ noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : themeCssVariables.spacing[3]};
  padding-right: ${({ noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : themeCssVariables.spacing[2]};

  .displayOnHover {
    opacity: ${({ isDropdownOpen }) => (isDropdownOpen ? 1 : 0)};
    pointer-events: ${({ isDropdownOpen }) =>
      isDropdownOpen ? 'auto' : 'none'};
    transition: opacity
      calc(${themeCssVariables.animation.duration.instant} * 1s) ease;
  }

  &:hover .displayOnHover {
    opacity: 1;
    pointer-events: auto;
  }
`;

type RecordDetailRecordsListItemContainerProps = {
  children: React.ReactNode;
  className?: string;
  isDropdownOpen?: boolean;
};

export const RecordDetailRecordsListItemContainer = ({
  children,
  className,
  isDropdownOpen,
}: RecordDetailRecordsListItemContainerProps) => {
  const layoutRenderingContext = useLayoutRenderingContext();

  const isInRecordPageLayout =
    layoutRenderingContext?.layoutType === PageLayoutType.RECORD_PAGE;

  return (
    <StyledListItem
      className={className}
      noHorizontalPadding={isInRecordPageLayout}
      isDropdownOpen={isDropdownOpen}
    >
      {children}
    </StyledListItem>
  );
};
