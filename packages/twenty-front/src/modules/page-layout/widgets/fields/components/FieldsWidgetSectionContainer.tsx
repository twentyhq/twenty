import styled from '@emotion/styled';
import { Section } from 'twenty-ui/layout';

const StyledFieldsWidgetSectionContainer = styled(Section)`
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  width: auto;
`;

const StyledHeader = styled.header`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type FieldsWidgetSectionContainerProps = {
  children: React.ReactNode;
  title: string;
};

export const FieldsWidgetSectionContainer = ({
  children,
  title,
}: FieldsWidgetSectionContainerProps) => {
  return (
    <StyledFieldsWidgetSectionContainer>
      <StyledHeader>
        <StyledTitleLabel>{title}</StyledTitleLabel>
      </StyledHeader>
      {children}
    </StyledFieldsWidgetSectionContainer>
  );
};
