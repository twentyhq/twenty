import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { PageLayoutType } from '~/generated/graphql';

const StyledListItem = styled('div', {
  shouldForwardProp: (prop) =>
    isPropValid(prop) && prop !== 'noHorizontalPadding',
})<{ noHorizontalPadding?: boolean }>`
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  padding-left: ${({ theme, noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : theme.spacing(3)};
  padding-right: ${({ theme, noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : theme.spacing(2)};
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
