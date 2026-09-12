import { CHAT_REFERENCE_IDENTITY_SHAPE_BY_KIND } from '@/ai/constants/ChatReferenceIdentityShapeByKind';
import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { type ChatReferenceKind } from '@/ai/types/ChatReferenceKind';
import { assertUnreachable } from 'twenty-shared/utils';

type ParsedChatReferenceBody = ChatReferenceIdentity & { displayName: string };

const isChatReferenceKind = (segment: string): segment is ChatReferenceKind =>
  Object.hasOwn(CHAT_REFERENCE_IDENTITY_SHAPE_BY_KIND, segment);

const getChatReferenceIdentity = ({
  kind,
  segments: [firstSegment, secondSegment],
}: {
  kind: ChatReferenceKind;
  segments: string[];
}): ChatReferenceIdentity => {
  switch (kind) {
    case 'record':
      return {
        kind,
        objectNameSingular: firstSegment,
        recordId: secondSegment,
      };
    case 'records':
      return { kind, objectMetadataId: firstSegment };
    case 'object':
      return { kind, objectNameSingular: firstSegment };
    case 'field':
      return {
        kind,
        objectNameSingular: firstSegment,
        fieldName: secondSegment,
      };
    case 'view':
      return { kind, viewId: firstSegment };
    case 'role':
      return { kind, roleId: firstSegment };
    case 'app':
      return { kind, applicationId: firstSegment };
    default:
      return assertUnreachable(kind);
  }
};

const parseSegments = ({
  kind,
  segments,
}: {
  kind: ChatReferenceKind;
  segments: string[];
}): ParsedChatReferenceBody | undefined => {
  const shape = CHAT_REFERENCE_IDENTITY_SHAPE_BY_KIND[kind];
  const identitySegments = segments.slice(0, shape.length);
  const hasLabel = segments.length > shape.length;

  if (
    !hasLabel ||
    !shape.every((regex, index) => regex.test(identitySegments[index]))
  ) {
    return undefined;
  }

  return {
    ...getChatReferenceIdentity({ kind, segments: identitySegments }),
    displayName: segments.slice(shape.length).join(':'),
  };
};

export const parseChatReferenceBody = (
  body: string,
): ParsedChatReferenceBody | undefined => {
  const segments = body.split(':');
  const [kindPrefix, ...identityAndLabel] = segments;

  // A recognised prefix followed by an identity of the wrong shape is a
  // retired or malformed marker, not a record of an object bearing that
  // name, so it must not fall through to the unprefixed record form.
  if (isChatReferenceKind(kindPrefix)) {
    return parseSegments({ kind: kindPrefix, segments: identityAndLabel });
  }

  return parseSegments({ kind: 'record', segments });
};
