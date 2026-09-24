import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS } from 'twenty-shared/constants';
import { Dropdown, SettingsRow, TintedIconTile } from 'twenty-ui/components';
import { IconCube } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
`;

type SidePanelObjectFilterDropdownContentProps = {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SidePanelObjectFilterDropdownContent = ({
  selectedObjectNameSingular,
  onSelectObject,
}: SidePanelObjectFilterDropdownContentProps) => {
  const { t } = useLingui();
  const [filterSearch, setFilterSearch] = useState('');
  const [sidePanelShowHiddenObjects, setSidePanelShowHiddenObjects] =
    useAtomState(sidePanelShowHiddenObjectsState);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  const searchFilter = filterSearch.toLowerCase();

  const displayedObjects = readableObjectMetadataItems.filter((item) => {
    if (
      OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS.includes(
        item.nameSingular as (typeof OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS)[number],
      )
    ) {
      return false;
    }

    if (!sidePanelShowHiddenObjects && !item.isSearchable) {
      return false;
    }

    return item.labelPlural.toLowerCase().includes(searchFilter);
  });

  return (
    <>
      <StyledHeader>{t`Object`}</StyledHeader>
      <Dropdown.Search
        value={filterSearch}
        placeholder={t`Search`}
        aria-label={t`Search`}
        onValueChange={setFilterSearch}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        <Dropdown.OptionItem
          onSelect={() => onSelectObject(null)}
          selected={selectedObjectNameSingular === null}
          startIcon={<TintedIconTile Icon={IconCube} />}
        >{t`All objects`}</Dropdown.OptionItem>
        {displayedObjects.map((objectMetadataItem) => (
          <Dropdown.OptionItem
            key={objectMetadataItem.id}
            onSelect={() => onSelectObject(objectMetadataItem.nameSingular)}
            selected={
              selectedObjectNameSingular === objectMetadataItem.nameSingular
            }
            startIcon={
              <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
            }
          >
            {objectMetadataItem.labelPlural}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section>
        <SettingsRow
          startIcon={<IconCube />}
          onCheckedChange={() =>
            setSidePanelShowHiddenObjects(!sidePanelShowHiddenObjects)
          }
          checked={sidePanelShowHiddenObjects}
        >{t`Show hidden objects`}</SettingsRow>
      </Dropdown.Section>
    </>
  );
};
