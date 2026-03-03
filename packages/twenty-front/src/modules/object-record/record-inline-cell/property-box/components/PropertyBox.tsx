import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutType } from '~/generated-metadata/graphql';

interface PropertyBoxProps {
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
}

const StyledPropertyBoxContainer = styled.div<{
  noHorizontalPadding?: boolean;
}>`
  align-self: stretch;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[3]};
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-left: ${({ noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : themeCssVariables.spacing[3]};
  padding-right: ${({ noHorizontalPadding }) =>
    noHorizontalPadding ? 0 : themeCssVariables.spacing[2]};
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
