import { createElement, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Button } from 'twenty-ui/primitives/input';
import {
  Card,
  type CardContentProps,
  type CardFooterProps,
  type CardHeaderProps,
  type CardRootProps,
} from 'twenty-ui/primitives/surfaces';
import { Heading, Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ROOT_PROPS = {
  id: 'display-card',
  title: 'Display card',
  fullWidth: true,
  rounded: true,
  backgroundColor: 'rgb(245, 246, 247)',
} satisfies CardRootProps;

const HEADER_PROPS = {
  title: 'Display header',
  dir: 'ltr',
} satisfies CardHeaderProps;

const CONTENT_PROPS = {
  title: 'Display content',
  divider: true,
} satisfies CardContentProps;

const FOOTER_PROPS = {
  title: 'Display footer',
  divider: false,
} satisfies CardFooterProps;

const CardComposition = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [refTargets, setRefTargets] = useState('');
  const [displayClicks, setDisplayClicks] = useState(0);
  const [buttonActivations, setButtonActivations] = useState(0);
  const [ownerActivations, setOwnerActivations] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);
  const [follows, setFollows] = useState(0);
  const [nativeTarget, setNativeTarget] = useState('');

  return (
    <TwentyUiGalleryCard title="Card composition">
      <Card.Root
        id={ROOT_PROPS.id}
        title={ROOT_PROPS.title}
        fullWidth={ROOT_PROPS.fullWidth}
        rounded={ROOT_PROPS.rounded}
        backgroundColor={ROOT_PROPS.backgroundColor}
        ref={rootRef}
        data-card-part="root"
        onClick={() => setDisplayClicks((count) => count + 1)}
      >
        <Card.Header
          title={HEADER_PROPS.title}
          dir={HEADER_PROPS.dir}
          ref={headerRef}
          data-card-part="header"
        >
          <Heading level={3}>Account summary</Heading>
        </Card.Header>
        <Card.Content
          title={CONTENT_PROPS.title}
          divider={CONTENT_PROPS.divider}
          ref={contentRef}
          data-card-part="content"
        >
          <Text>Display-only account details</Text>
        </Card.Content>
        <Card.Footer
          title={FOOTER_PROPS.title}
          divider={FOOTER_PROPS.divider}
          ref={footerRef}
          data-card-part="footer"
        >
          <Button
            onClick={() => {
              setRefTargets(
                [rootRef, headerRef, contentRef, footerRef]
                  .map((ref) => ref.current?.getAttribute('data-card-part'))
                  .join('/'),
              );
            }}
          >
            Read card refs
          </Button>
        </Card.Footer>
      </Card.Root>
      <Card.Root render={<article aria-labelledby="composed-card-title" />}>
        <Card.Header render={<header />} title="Composed header">
          <Heading id="composed-card-title" level={3}>
            Composed account
          </Heading>
        </Card.Header>
        <Card.Content
          render={(props) =>
            createElement('section', {
              ...props,
              'aria-label': 'Composed account details',
            })
          }
        >
          <Text>Account owner: Alice</Text>
        </Card.Content>
        <Card.Footer render={<footer />} title="Composed footer">
          <Button onClick={() => setFollows((count) => count + 1)}>
            Follow account
          </Button>
        </Card.Footer>
      </Card.Root>
      <Card.Root
        render={
          <button
            ref={buttonRef}
            type="button"
            data-native-owner="button"
            onClick={() => setOwnerActivations((count) => count + 1)}
          />
        }
        onClick={() => {
          setButtonActivations((count) => count + 1);
          setNativeTarget(
            buttonRef.current?.getAttribute('data-native-owner') ?? '',
          );
        }}
      >
        <Card.Content render={<span />}>Open account</Card.Content>
      </Card.Root>
      <Card.Root
        render={<button type="button" disabled />}
        onClick={() => setButtonActivations((count) => count + 1)}
      >
        <Card.Content render={<span />}>Unavailable account</Card.Content>
      </Card.Root>
      <Card.Root
        render={
          <a ref={linkRef} href="/objects/account" data-native-owner="link" />
        }
        onClick={() => {
          setLinkActivations((count) => count + 1);
          setNativeTarget(
            linkRef.current?.getAttribute('data-native-owner') ?? '',
          );
        }}
      >
        <Card.Content render={<span />}>Account record</Card.Content>
      </Card.Root>
      <Text aria-label="Card ref targets">{refTargets}</Text>
      <Text aria-label="Display card clicks">{displayClicks}</Text>
      <Text aria-label="Card button activations">{buttonActivations}</Text>
      <Text aria-label="Card owner activations">{ownerActivations}</Text>
      <Text aria-label="Card link activations">{linkActivations}</Text>
      <Text aria-label="Account follows">{follows}</Text>
      <Text aria-label="Card native target">{nativeTarget}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '01554c42-e5bd-43c5-a9f7-0683c5340e95',
  name: 'twenty-ui-card-composition',
  description: 'Card native parts, render composition and interactive owners',
  component: CardComposition,
});
