import {
  StyledContainer,
  StyledDescription,
  StyledTitle,
} from '../SettingsImport.styles';

export type HeadingProps = {
  title: string;
  description?: string;
};

export const Heading = ({ title, description }: HeadingProps) => (
  <StyledContainer>
    <StyledTitle>{title}</StyledTitle>
    {description && <StyledDescription>{description}</StyledDescription>}
  </StyledContainer>
);
