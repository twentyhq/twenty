import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, useSelectedRecordIds } from 'twenty-sdk/front-component';
import {
  PDL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS,
  PDL_LOGIC_FUNCTION_CONSTANTS
} from 'src/constants/universal-identifiers';
import { execute } from 'src/front-components/utils/call-enrich-logic-function.utils';


const Enrich = () => {
  const recordIds = useSelectedRecordIds();
  return <Command execute={() => execute({ path: PDL_LOGIC_FUNCTION_CONSTANTS.enrichPeople.path, recordIds })} />;
};

export default defineFrontComponent({
  universalIdentifier: PDL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.enrichPeople,
  name: 'enrich-people-effect',
  description: 'Enrich people effect',
  component: Enrich,
  isHeadless: true
});
