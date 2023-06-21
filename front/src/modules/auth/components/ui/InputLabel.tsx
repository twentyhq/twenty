import styled from '@emotion/styled';

type OwnProps = {
  label: string;
  subLabel?: string;
};

const StyledContainer = styled.div`
  font-weight: ${({ theme }) => theme.fontWeightMedium};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export function InputLabel({ label, subLabel }: OwnProps): JSX.Element {
  return <StyledContainer>{label}</StyledContainer>;
}
