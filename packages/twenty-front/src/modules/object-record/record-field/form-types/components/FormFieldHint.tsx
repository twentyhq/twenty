import styled from '@emotion/styled';

const StyledFormFieldHint = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const FormFieldHint = StyledFormFieldHint;
