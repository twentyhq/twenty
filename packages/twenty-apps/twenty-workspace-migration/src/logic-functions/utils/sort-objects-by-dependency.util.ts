import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";
import { ObjectType, RelationType } from "src/logic-functions/types/find-objects-fields.type";

// Orders objects so that, for every MANY_TO_ONE relation field, the object it targets
// (if present in the input list) comes out earlier - relation targets must exist before
// a field or record pointing at them can be created. Relation targets not present in the
// input list (e.g. already-existing objects outside the set being ordered) are ignored:
// they impose no ordering constraint here. Circular dependencies are broken arbitrarily
// at whichever edge closes the loop, since a true cycle can't be fully satisfied up front.
export const sortObjectsByDependency = (objects: ObjectType[]): ObjectType[] => {
  const byUniversalIdentifier = new Map(
    objects.map((object) => [object.universalIdentifier, object]),
  );
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: ObjectType[] = [];

  const visit = (object: ObjectType) => {
    if (visited.has(object.universalIdentifier) || visiting.has(object.universalIdentifier)) {
      return;
    }
    visiting.add(object.universalIdentifier);

    for (const field of object.fieldsList) {
      if (field.type !== FieldMetadataType.RELATION) {
        continue;
      }
      if (field.relation?.type !== RelationType.MANY_TO_ONE) {
        continue;
      }

      const target = byUniversalIdentifier.get(
        field.relation.targetObjectMetadata.universalIdentifier,
      );

      if (target !== undefined && target.universalIdentifier !== object.universalIdentifier) {
        visit(target);
      }
    }

    visiting.delete(object.universalIdentifier);
    visited.add(object.universalIdentifier);
    order.push(object);
  };

  for (const object of objects) {
    visit(object);
  }

  return order;
};
