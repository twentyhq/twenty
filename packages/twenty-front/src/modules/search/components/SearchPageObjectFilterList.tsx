import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { TintedIconTile } from 'twenty-ui/data-display';
import { IconCube } from 'twenty-ui/icon';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Label } from 'twenty-ui/typography';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useSearchFilterableObjectMetadataItems } from '@/search/hooks/useSearchFilterableObjectMetadataItems';

const StyledContainer = styled.nav`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  width: 200px;
`;

const StyledHeading = styled.div`
  padding: ${themeCssVariables.spacing[1]};
  user-select: none;
`;

type SearchPageObjectFilterListProps = {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SearchPageObjectFilterList = ({
  selectedObjectNameSingular,
  onSelectObject,
}: SearchPageObjectFilterListProps) => {
  const { t } = useLingui();
  const objectMetadataItems = useSearchFilterableObjectMetadataItems();

  return (
    <StyledContainer>
      <StyledHeading>
        <Label>{t`Object`}</Label>
      </StyledHeading>
      <MenuItemSelectAvatar
        avatar={<TintedIconTile Icon={IconCube} />}
        text={t`All objects`}
        selected={selectedObjectNameSingular === null}
        onClick={() => onSelectObject(null)}
      />
      {objectMetadataItems.map((objectMetadataItem) => (
        <MenuItemSelectAvatar
          key={objectMetadataItem.id}
          avatar={
            <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
          }
          text={objectMetadataItem.labelPlural}
          selected={
            selectedObjectNameSingular === objectMetadataItem.nameSingular
          }
          onClick={() => onSelectObject(objectMetadataItem.nameSingular)}
        />
      ))}
    </StyledContainer>
  );
};
