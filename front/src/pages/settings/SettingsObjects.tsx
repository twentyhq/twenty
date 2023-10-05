import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  IconBuildingSkyscraper,
  IconChevronRight,
  IconDotsVertical,
  IconLuggage,
  IconPlane,
  IconSettings,
  IconUser,
} from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';
import { Table } from '@/ui/table/components/Table';
import { TableCell } from '@/ui/table/components/TableCell';
import { TableHeader } from '@/ui/table/components/TableHeader';
import { TableRow } from '@/ui/table/components/TableRow';
import { TableSection } from '@/ui/table/components/TableSection';
import { Tag } from '@/ui/tag/components/Tag';
import { H1Title } from '@/ui/typography/components/H1Title';
import { H2Title } from '@/ui/typography/components/H2Title';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(8)};
  width: 512px;
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 180px 98.7px 98.7px 98.7px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTag = styled(Tag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(4)};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledIconDotsVertical = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const activeObjectItems = [
  {
    name: 'Companies',
    Icon: IconBuildingSkyscraper,
    type: 'standard',
    fields: 23,
    instances: 165,
  },
  {
    name: 'People',
    Icon: IconUser,
    type: 'standard',
    fields: 16,
    instances: 462,
  },
];

const disabledObjectItems = [
  {
    name: 'Travels',
    Icon: IconLuggage,
    type: 'custom',
    fields: 23,
    instances: 165,
  },
  {
    name: 'Flights',
    Icon: IconPlane,
    type: 'custom',
    fields: 23,
    instances: 165,
  },
];

export const SettingsObjects = () => {
  const theme = useTheme();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <StyledContainer>
        <H1Title title="Objects" />
        <H2Title title="Existing objects" />
        <Table>
          <StyledTableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader align="right">Fields</TableHeader>
            <TableHeader align="right">Instances</TableHeader>
            <TableHeader></TableHeader>
          </StyledTableRow>
          <TableSection title="Active">
            {activeObjectItems.map((objectItem) => (
              <StyledTableRow key={objectItem.name} onClick={() => undefined}>
                <StyledNameTableCell>
                  <objectItem.Icon size={theme.icon.size.md} />
                  {objectItem.name}
                </StyledNameTableCell>
                <TableCell>
                  {objectItem.type === 'standard' ? (
                    <StyledTag color="blue" text="Standard" />
                  ) : (
                    <StyledTag color="orange" text="Custom" />
                  )}
                </TableCell>
                <TableCell>{objectItem.fields}</TableCell>
                <TableCell>{objectItem.instances}</TableCell>
                <StyledIconTableCell>
                  <StyledIconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </StyledIconTableCell>
              </StyledTableRow>
            ))}
          </TableSection>
          {!!disabledObjectItems.length && (
            <TableSection title="Disabled">
              {disabledObjectItems.map((objectItem) => (
                <StyledTableRow key={objectItem.name}>
                  <StyledNameTableCell>
                    <objectItem.Icon size={theme.icon.size.md} />
                    {objectItem.name}
                  </StyledNameTableCell>
                  <TableCell>
                    {objectItem.type === 'standard' ? (
                      <StyledTag color="blue" text="Standard" />
                    ) : (
                      <StyledTag color="orange" text="Custom" />
                    )}
                  </TableCell>
                  <TableCell>{objectItem.fields}</TableCell>
                  <TableCell>{objectItem.instances}</TableCell>
                  <StyledIconTableCell>
                    <StyledIconDotsVertical
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  </StyledIconTableCell>
                </StyledTableRow>
              ))}
            </TableSection>
          )}
        </Table>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
