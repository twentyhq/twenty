import { type Manifest } from 'twenty-shared/application';
import { isObjectRootToolInputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

export const validateToolInputSchemaRoots = (
  manifest: Pick<Manifest, 'logicFunctions'>,
): string[] =>
  manifest.logicFunctions
    .filter((logicFunction) => {
      const inputSchema = logicFunction.toolTriggerSettings?.inputSchema;

      return (
        isDefined(inputSchema) && !isObjectRootToolInputSchema(inputSchema)
      );
    })
    .map(
      (logicFunction) =>
        `Logic function "${logicFunction.name ?? logicFunction.universalIdentifier}" declares a tool input schema whose root is not an object. Wrap the input in an object property, for example { type: 'object', properties: { recordId: ... } }.`,
    );
