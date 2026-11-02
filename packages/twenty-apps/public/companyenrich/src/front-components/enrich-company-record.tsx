import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

import { Research } from 'src/components/research';

const EnrichRecord = () => {
  const recordIds = useSelectedRecordIds();
  if (recordIds.length !== 1) {
    return (
      <p>
        Select one company record to enrich. Use the workflow action for each
        record in a batch.
      </p>
    );
  }
  return (
    <Research initialAction="enrich-company-record" recordId={recordIds[0]} />
  );
};

export default defineFrontComponent({
  universalIdentifier: '9cc7071d-128d-4346-ac83-45437f6c52a6',
  name: 'companyenrich-enrich-company-panel',
  description: 'Review and explicitly enrich a selected company record.',
  component: EnrichRecord,
});
