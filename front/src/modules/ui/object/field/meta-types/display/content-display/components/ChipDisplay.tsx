type ChipDisplayProps = {
  displayName: string;
  entityId: string | null;
  avatarUrlValue?: string;
};

export const ChipDisplay = ({
  displayName,
  entityId,
  avatarUrlValue,
}: ChipDisplayProps) => {
  switch (true) {
    // case Entity.Company: {
    //   return (
    //     <CompanyChip
    //       id={entityId ?? ''}
    //       name={displayName}
    //       avatarUrl={getLogoUrlFromDomainName(avatarUrlValue)}
    //     />
    //   );
    // }
    // case Entity.Person: {
    //   return (
    //     <PersonChip
    //       id={entityId ?? ''}
    //       name={displayName}
    //       avatarUrl={avatarUrlValue}
    //     />
    //   );
    // }
    default:
      return <> </>;
  }
};
