import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsObjectItemTableRow,
  StyledObjectTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { SettingsObjectCoverImage } from '@/settings/data-model/objects/SettingsObjectCoverImage';
import { SettingsObjectDisabledMenuDropDown } from '@/settings/data-model/objects/SettingsObjectDisabledMenuDropDown';
import { IconChevronRight, IconPlus, IconSettings } from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsObjects = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    activateObjectMetadataItem,
    activeObjectMetadataItems,
    disabledObjectMetadataItems,
    eraseObjectMetadataItem,
  } = useObjectMetadataItemForSettings();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <StyledH1Title title="Objects" />
          <Button
            Icon={IconPlus}
            title="Add object"
            accent="blue"
            size="small"
            onClick={() => navigate('/settings/objects/new')}
          />
        </SettingsHeaderContainer>
        <div>
          <SettingsObjectCoverImage />
          <Section>
            <H2Title title="Existing objects" />
            <Table>
              <StyledObjectTableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader align="right">Fields</TableHeader>
                <TableHeader align="right">Instances</TableHeader>
                <TableHeader></TableHeader>
              </StyledObjectTableRow>
              {!!activeObjectMetadataItems.length && (
                <TableSection title="Active">
                  {activeObjectMetadataItems.map((activeObjectMetadataItem) => (
                    <SettingsObjectItemTableRow
                      key={activeObjectMetadataItem.namePlural}
                      objectItem={activeObjectMetadataItem}
                      action={
                        <StyledIconChevronRight
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      }
                      onClick={() =>
                        navigate(
                          `/settings/objects/${getObjectSlug(
                            activeObjectMetadataItem,
                          )}`,
                        )
                      }
                    />
                  ))}
                </TableSection>
              )}
              {!!disabledObjectMetadataItems.length && (
                <TableSection title="Disabled">
                  {disabledObjectMetadataItems.map(
                    (disabledObjectMetadataItem) => (
                      <SettingsObjectItemTableRow
                        key={disabledObjectMetadataItem.namePlural}
                        objectItem={disabledObjectMetadataItem}
                        action={
                          <SettingsObjectDisabledMenuDropDown
                            isCustomObject={disabledObjectMetadataItem.isCustom}
                            scopeKey={disabledObjectMetadataItem.namePlural}
                            onActivate={() =>
                              activateObjectMetadataItem(
                                disabledObjectMetadataItem,
                              )
                            }
                            onErase={() =>
                              eraseObjectMetadataItem(
                                disabledObjectMetadataItem,
                              )
                            }
                          />
                        }
                      />
                    ),
                  )}
                </TableSection>
              )}
            </Table>
          </Section>
        </div>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
