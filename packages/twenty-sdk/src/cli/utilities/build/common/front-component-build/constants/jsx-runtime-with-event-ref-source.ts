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

function getClonedElementRef(element, config, readsElementRefFromVnode) {
  if (doesCloneConfigOverrideRef(config, readsElementRefFromVnode)) {
    return config.ref;
  }

  if (readsElementRefFromVnode) {
    return element.ref;
  }

  return element.props.ref;
}

function makeCloneEventRef(clonedElementRef, cloneEvents) {
  const isNestedClone =
    clonedElementRef != null && clonedElementRef._eventSource === 'clone';
  if (!isNestedClone) {
    return makeEventRef(cloneEvents, clonedElementRef, 'clone');
  }

  const mergedCloneEvents = Object.assign(
    {},
    clonedElementRef._eventProps,
    cloneEvents,
  );
  return makeEventRef(mergedCloneEvents, clonedElementRef._userRef, 'clone');
}

export function withCloneEventRef(element, config, readsElementRefFromVnode) {
  const { cleanProps: cleanConfig, events: cloneEvents } =
    splitEventProps(config);
  const clonedElementRef = getClonedElementRef(
    element,
    config,
    readsElementRefFromVnode,
  );
  cleanConfig.ref = makeCloneEventRef(clonedElementRef, cloneEvents);
  return cleanConfig;
}
`.trim();
