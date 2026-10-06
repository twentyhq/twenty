export const JSX_RUNTIME_WITH_EVENT_REF_SOURCE = `
export function withJsxEventRef(props) {
  const { cleanProps, events } = splitEventProps(props);
  cleanProps.ref = makeEventRef(events, cleanProps.ref, 'jsx');
  return cleanProps;
}

function doesCloneConfigOverrideRef(config, readsElementRefFromVnode) {
  if (config == null) {
    return false;
  }

  if (readsElementRefFromVnode) {
    return !!config.ref;
  }

  return config.ref !== undefined;
}

function getElementRef(element, readsElementRefFromVnode) {
  if (readsElementRefFromVnode) {
    return element.ref;
  }

  return element.props.ref;
}

function isCloneEventRef(ref) {
  return ref != null && ref._eventSource === 'clone';
}

function getOuterWinningCloneEventsOf(cloneEventRef) {
  return cloneEventRef._outerWinningCloneEvents || cloneEventRef._eventProps;
}

function makeCloneEventRef({
  elementRef,
  configRef,
  overridesElementRef,
  cloneEvents,
}) {
  if (!isCloneEventRef(elementRef)) {
    const cloneUserRef = overridesElementRef ? configRef : elementRef;
    return makeEventRef(cloneEvents, cloneUserRef, 'clone');
  }

  const innerCloneEvents = elementRef._eventProps;
  const outerWinningCloneEvents = mergeCloneEventsOuterWinning(
    getOuterWinningCloneEventsOf(elementRef),
    cloneEvents,
  );
  const keepsInnerCloneUserRef =
    !overridesElementRef || configRef === elementRef;
  const hasInnerOuterWinningCloneEvents =
    !!elementRef._outerWinningCloneEvents;
  if (keepsInnerCloneUserRef && !hasInnerOuterWinningCloneEvents) {
    return makeEventRef(outerWinningCloneEvents, elementRef._userRef, 'clone');
  }

  if (keepsInnerCloneUserRef) {
    return createEventRef(
      mergeCloneEventsOuterWinning(innerCloneEvents, cloneEvents),
      elementRef._userRef,
      'clone',
      outerWinningCloneEvents,
    );
  }

  const chainedCloneEvents = chainCloneEvents(innerCloneEvents, cloneEvents);
  if (chainedCloneEvents === null) {
    return makeEventRef(null, configRef, 'clone');
  }

  return createEventRef(
    chainedCloneEvents,
    configRef,
    'clone',
    outerWinningCloneEvents,
  );
}

export function withCloneEventRef(element, config, readsElementRefFromVnode) {
  const { cleanProps: cleanConfig, events: cloneEvents } =
    splitEventProps(config);
  cleanConfig.ref = makeCloneEventRef({
    elementRef: getElementRef(element, readsElementRefFromVnode),
    configRef: config == null ? undefined : config.ref,
    overridesElementRef: doesCloneConfigOverrideRef(
      config,
      readsElementRefFromVnode,
    ),
    cloneEvents,
  });
  return cleanConfig;
}
`.trim();
