import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  activeObjectItems,
  disabledObjectItems,
} from '@/settings/data-model/constants/mockObjects';
import {
  IconChevronRight,
  IconDotsVertical,
  IconPlus,
  IconSettings,
} from '@/ui/display/icon';
import { Tag } from '@/ui/display/tag/components/Tag';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';

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

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsObjects = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <StyledH1Title title="Objects" />
          <Button
            Icon={IconPlus}
            title="New object"
            accent="blue"
            size="small"
            onClick={() => {
              navigate('/settings/objects/new');
            }}
          />
        </SettingsHeaderContainer>
        <Section>
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
                <StyledTableRow
                  key={objectItem.name}
                  onClick={() =>
                    navigate(
                      `/settings/objects/${objectItem.name.toLowerCase()}`,
                    )
                  }
                >
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
                  <TableCell align="right">{objectItem.fields}</TableCell>
                  <TableCell align="right">{objectItem.instances}</TableCell>
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
                    <TableCell align="right">{objectItem.fields}</TableCell>
                    <TableCell align="right">{objectItem.instances}</TableCell>
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
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
