import { defineFrontComponent } from 'twenty-sdk/define';
import {
  useSelectedObjectMetadata,
  useSelectedRecordIds,
  useRecordId,
  useColorScheme,
  useFrontComponentExecutionContext,
} from 'twenty-sdk/front-component';

const RecordWidget = () => {
  const recordId = useSelectedRecordIds()[0];
  const objectMetadata = useSelectedObjectMetadata();
  const recordContextId = useRecordId();
  const colorScheme = useColorScheme();
  const userId = useFrontComponentExecutionContext((context) => context.userId);

  return (
    <div>
      <p>
        {recordId
          ? `${objectMetadata?.nameSingular}: ${recordId}`
          : 'No record selected'}
      </p>
      <p>Record: {recordContextId ?? 'none'}</p>
      <p>Theme: {colorScheme}</p>
      <p>User: {userId ?? 'none'}</p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a5e53b84-52c9-4c7e-a331-4552935f5b60',
  name: 'record-context',
  description: 'Displays the selected record and execution context',
  component: RecordWidget,
});
