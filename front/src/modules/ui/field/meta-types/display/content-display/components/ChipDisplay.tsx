import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { getLogoUrlFromDomainName } from '~/utils';

type OwnProps = {
  entityType: Entity;
  displayName: string;
  entityId: string | null;
  avatarUrlValue?: string;
};

export const ChipDisplay = ({
  entityType,
  displayName,
  entityId,
  avatarUrlValue,
}: OwnProps) => {
  switch (entityType) {
    case Entity.Company: {
      return (
        <CompanyChip
          id={entityId ?? ''}
          name={displayName}
          pictureUrl={getLogoUrlFromDomainName(avatarUrlValue)}
        />
      );
    }
    case Entity.Person: {
      return (
        <PersonChip
          id={entityId ?? ''}
          name={displayName}
          pictureUrl={avatarUrlValue}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${entityType}" in DoubleTextChipDisplay`,
      );
      return <> </>;
  }
};
