import { StyledGroup, StyledGroupHeading } from './KeyboardShortcutMenuStyles';

type KeyboardMenuGroupProps = {
  heading: string;
  children: React.ReactNode | React.ReactNode[];
};

export const KeyboardMenuGroup = ({
  heading,
  children,
}: KeyboardMenuGroupProps) => {
  return (
    <StyledGroup>
      <StyledGroupHeading>{heading}</StyledGroupHeading>
      {children}
    </StyledGroup>
  );
};
