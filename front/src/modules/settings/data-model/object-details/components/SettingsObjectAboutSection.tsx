import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconDotsVertical } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Tag } from '@/ui/display/tag/components/Tag';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAboutSectionProps = {
  Icon: IconComponent;
  name: string;
  type: string;
};

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTableRow = styled(TableRow)`
  background-color: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTag = styled(Tag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(4)};
`;

const StyledIconDotsVertical = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledFlexContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SettingsAboutSection = ({
  Icon,
  name,
  type,
}: SettingsAboutSectionProps) => {
  const theme = useTheme();
  return (
    <Section>
      <H2Title title="About" description={`Manage you object`} />
      <StyledTableRow>
        <StyledNameTableCell>
          <Icon size={theme.icon.size.md} />
          {name}
        </StyledNameTableCell>
        <StyledFlexContainer>
          <TableCell>
            {type === 'standard' ? (
              <StyledTag color="blue" text="Standard" />
            ) : (
              <StyledTag color="orange" text="Custom" />
            )}
          </TableCell>
          <StyledIconTableCell>
            <StyledIconDotsVertical
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </StyledIconTableCell>
        </StyledFlexContainer>
      </StyledTableRow>
    </Section>
  );
};
