import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { PageLayoutType } from '~/generated/graphql';

interface PropertyBoxProps {
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
}

const StyledPropertyBoxContainer = styled('div', {
  shouldForwardProp: (prop) =>
    isPropValid(prop) && prop !== 'noHorizontalPadding',
})<{ noHorizontalPadding?: boolean }>`
  align-self: stretch;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme, noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : theme.spacing(3)};
  padding-right: ${({ theme, noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : theme.spacing(2)};
`;

export const PropertyBox = ({
  children,
  className,
  dataTestId,
}: PropertyBoxProps) => {
  const layoutRenderingContext = useLayoutRenderingContext();

  const isInRecordPageLayout =
    layoutRenderingContext.layoutType === PageLayoutType.RECORD_PAGE;

  return (
    <StyledPropertyBoxContainer
      className={className}
      data-testid={dataTestId}
      noHorizontalPadding={isInRecordPageLayout}
    >
      {children}
    </StyledPropertyBoxContainer>
  );
};
