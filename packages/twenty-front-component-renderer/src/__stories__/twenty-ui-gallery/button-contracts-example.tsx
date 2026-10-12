import { createElement, useState } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconPlus, IconX } from 'twenty-ui/icon';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const ButtonContractsExample = () => {
  const [nativeClicks, setNativeClicks] = useState(0);
  const [clickDetails, setClickDetails] = useState('none');
  const [callbackLinkClicks, setCallbackLinkClicks] = useState(0);
  const [labelledIconClicks, setLabelledIconClicks] = useState(0);
  const [centerLoading, setCenterLoading] = useState(false);

  return (
    <>
      <Button
        nativeButton
        data-contract-target="native-button"
        href="#native-button-contract"
        render={<button />}
        ref={(element) => {
          element?.setAttribute('data-ref-target', 'native-button');
        }}
        onClick={(event) => {
          setNativeClicks((count) => count + 1);
          setClickDetails(
            `${event.currentTarget.getAttribute('data-contract-target')}:${event.type}:${event.button}:${typeof event.preventBaseUIHandler}`,
          );
        }}
      >
        Custom native button
      </Button>
      <Text aria-label="Native button activations">{nativeClicks}</Text>
      <Text aria-label="Button click details">{clickDetails}</Text>
      <Button
        nativeButton={false}
        role="link"
        href="#composed-button-link"
        hrefLang="fr"
        media="screen"
        ping="https://twenty.com/ping"
        referrerPolicy="no-referrer"
        download="button-contract.txt"
        render={
          <a
            type="text/plain"
            ref={(element) => {
              element?.setAttribute('data-render-ref-target', 'element-link');
            }}
          />
        }
        ref={(element) => {
          element?.setAttribute('data-ref-target', 'element-link');
        }}
      >
        Composed download link
      </Button>
      <Button href="#boolean-download" download>
        Download without filename
      </Button>
      <Button
        nativeButton={false}
        role="link"
        href="#callback-button-link"
        target="_self"
        data-contract-target="callback-link"
        render={(props, state) =>
          createElement('a', {
            ...props,
            'data-render-disabled': String(state.disabled),
          })
        }
        ref={(element) => {
          element?.setAttribute('data-ref-target', 'callback-link');
        }}
        onClick={(event) => {
          event.preventDefault();
          setCallbackLinkClicks((count) => count + 1);
          setClickDetails(
            `${event.currentTarget.getAttribute('data-contract-target')}:${event.type}:${event.button}:${typeof event.preventBaseUIHandler}`,
          );
        }}
      >
        Callback rendered link
      </Button>
      <Text aria-label="Callback link activations">{callbackLinkClicks}</Text>
      <Text id="labelled-icon-button-name">Labelled icon action</Text>
      <IconButton
        aria-labelledby="labelled-icon-button-name"
        onClick={() => setLabelledIconClicks((count) => count + 1)}
      >
        <IconPlus />
      </IconButton>
      <Text aria-label="Labelled icon activations">{labelledIconClicks}</Text>
      <ButtonGroup
        aria-label="Appearance defaults"
        variant="solid"
        color="danger"
        size="sm"
      >
        <Button>Inherited appearance</Button>
        <Button variant="ghost" color="success" size="md">
          Explicit appearance
        </Button>
        <IconButton aria-label="Inherited icon appearance">
          <IconPlus />
        </IconButton>
        <IconButton
          aria-label="Explicit icon appearance"
          variant="outline"
          color="accent"
          size="xs"
        >
          <IconPlus />
        </IconButton>
      </ButtonGroup>
      <Button loading={centerLoading}>Preserve center content width</Button>
      <Button onClick={() => setCenterLoading(!centerLoading)}>
        Toggle center loading
      </Button>
      <Button
        loading
        loadingPosition="start"
        startIcon={<IconPlus data-testid="start-loading-original-icon" />}
        endIcon={<IconX data-testid="start-loading-retained-icon" />}
      >
        Loading at start
      </Button>
      <Button
        loading
        loadingPosition="end"
        startIcon={<IconPlus data-testid="end-loading-retained-icon" />}
        endIcon={<IconX data-testid="end-loading-original-icon" />}
      >
        Loading at end
      </Button>
    </>
  );
};
