export const JSX_RUNTIME_USER_REF_REPLACEMENT_SOURCE = `
const replacedEventRefByUserRefByEventRef = new WeakMap();
const nullUserRefKey = {};

function isEventRef(ref) {
  return typeof ref === 'function' && ref._eventSource !== undefined;
}

function getReplacedEventRefByUserRef(eventRef) {
  const memoizedReplacedEventRefByUserRef =
    replacedEventRefByUserRefByEventRef.get(eventRef);
  if (memoizedReplacedEventRefByUserRef) {
    return memoizedReplacedEventRefByUserRef;
  }

  const replacedEventRefByUserRef = new WeakMap();
  replacedEventRefByUserRefByEventRef.set(eventRef, replacedEventRefByUserRef);
  return replacedEventRefByUserRef;
}

function replaceInnermostUserRef(ref, userRef) {
  if (!isEventRef(ref)) {
    return userRef;
  }

  const replacedEventRefByUserRef = getReplacedEventRefByUserRef(ref);
  const userRefKey = userRef == null ? nullUserRefKey : userRef;
  const memoizedReplacedEventRef = replacedEventRefByUserRef.get(userRefKey);
  if (memoizedReplacedEventRef) {
    return memoizedReplacedEventRef;
  }

  const replacedEventRef = createEventRef(
    ref._eventProps,
    replaceInnermostUserRef(ref._userRef, userRef),
    ref._eventSource,
    ref._outerWinningCloneEvents,
  );
  replacedEventRefByUserRef.set(userRefKey, replacedEventRef);
  return replacedEventRef;
}
`.trim();
