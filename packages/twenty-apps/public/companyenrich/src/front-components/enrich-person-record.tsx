import { IDENTIFIERS } from 'src/constants/universal-identifiers';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

import { Research } from 'src/components/research';

const EnrichRecord = () => {
  const recordIds = useSelectedRecordIds();
  if (recordIds.length !== 1) {
    return (
      <p>
        Select one person record to enrich. Use the workflow action for each
        record in a batch.
      </p>
    );
  }
  return (
    <Research initialAction="enrich-person-record" recordId={recordIds[0]} />
  );
};

export default defineFrontComponent({
  universalIdentifier: IDENTIFIERS.enrichPersonPanel,
  name: 'companyenrich-enrich-person-panel',
  description: 'Review and explicitly enrich a selected person record.',
  component: EnrichRecord,
});
