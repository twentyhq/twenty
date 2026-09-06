<p align="center">
  <a href="https://www.twenty.com">
    <img src="./packages/twenty-website/public/images/core/logo.svg" width="100px" alt="Twenty logo" />
  </a>
</p>

<h2 align="center">The #1 Open-Source CRM</h2>

<p align="center"><a href="https://twenty.com"><img src="./packages/twenty-website/public/images/readme/globe-icon.svg" width="12" height="12"/> Website</a> · <a href="https://docs.twenty.com"><img src="./packages/twenty-website/public/images/readme/book-icon.svg" width="12" height="12"/> Documentation</a> · <a href="https://github.com/orgs/twentyhq/projects/1"><img src="./packages/twenty-website/public/images/readme/map-icon.svg" width="12" height="12"/> Roadmap </a> · <a href="https://discord.gg/cx5n4Jzs57"><img src="./packages/twenty-website/public/images/readme/discord-icon.svg" width="12" height="12"/> Discord</a> · <a href="https://www.figma.com/file/xt8O9mFeLl46C5InWwoMrN/Twenty"><img src="./packages/twenty-website/public/images/readme/figma-icon.webp"  width="12" height="12"/>  Figma</a></p>

<p align="center">
  <a href="https://www.twenty.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/github-cover-dark.webp" />
      <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/github-cover-light.webp" />
      <img src="./packages/twenty-website/public/images/readme/github-cover-light.webp" alt="Twenty banner" />
    </picture>
  </a>
</p>

<br />

# Why Twenty

Twenty gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolves. Twenty is the CRM you build, ship, and version like the rest of your stack.

<a href="https://twenty.com/resources/why-twenty"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="14" height="14"/> Learn more about why we built Twenty</a>

<br />

# Installation

### <img src="./packages/twenty-website/public/images/readme/globe-icon.svg" width="14" height="14"/> Cloud

The fastest way to get started. Sign up at [twenty.com](https://twenty.com) and spin up a workspace in under a minute, with no infrastructure to manage and always up to date.

### <img src="./packages/twenty-website/public/images/readme/book-icon.svg" width="14" height="14"/> Build an app

Scaffold a new app with the Twenty CLI:

```bash
npx create-twenty-app my-app
```

Define objects, fields, and views as code:

```ts
import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'deal',
  namePlural: 'deals',
  labelSingular: 'Deal',
  labelPlural: 'Deals',
  fields: [
    { name: 'name', label: 'Name', type: FieldType.TEXT },
    { name: 'amount', label: 'Amount', type: FieldType.CURRENCY },
    { name: 'closeDate', label: 'Close Date', type: FieldType.DATE_TIME },
  ],
});
```

Then ship it to your workspace:

```bash
npx twenty app:publish --private
```

See the [app development guide](https://docs.twenty.com/developers/extend/apps/getting-started) for objects, views, agents, and logic functions.

### <img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="14" height="14"/> Self-hosting

Run Twenty on your own infrastructure with [Docker Compose](https://docs.twenty.com/developers/self-host/capabilities/docker-compose), or contribute locally via the [local setup guide](https://docs.twenty.com/developers/contribute/capabilities/local-setup).

<br />
<br />

# Everything you need

Twenty gives you the building blocks of a modern CRM (objects, views, workflows, and agents) and lets you extend them as code. Here's a tour of what's in the box.

Want to go deeper? Read the <a href="https://docs.twenty.com/user-guide/introduction"><img src="./packages/twenty-website/public/images/readme/planner-icon.svg" width="14" height="14"/> User Guide</a> for product walkthroughs, or the <a href="https://docs.twenty.com"><img src="./packages/twenty-website/public/images/readme/book-icon.svg" width="14" height="14"/> Documentation</a> for developer reference.

<table align="center">
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-build-apps-light.webp" alt="Create your apps" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/developers/extend/apps/getting-started"><img src="./packages/twenty-website/public/images/readme/code-icon.svg" width="16" height="16"/> Learn more about apps in doc</a></p>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-version-control-light.webp" alt="Stay on top with version control" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/developers/extend/apps/publishing"><img src="./packages/twenty-website/public/images/readme/monitor-icon.svg" width="16" height="16"/> Learn more about version control in doc</a></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-all-tools-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-all-tools-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-all-tools-light.webp" alt="All the tools you need to build anything" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/developers/extend/apps/building"><img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="16" height="16"/> Learn more about primitives in doc</a></p>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-tools-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-tools-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-tools-light.webp" alt="Customize your layouts" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/user-guide/layout/overview"><img src="./packages/twenty-website/public/images/readme/planner-icon.svg" width="16" height="16"/> Learn more about layouts in doc</a></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-ai-agents-light.webp" alt="AI agents and chats" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/user-guide/ai/overview"><img src="./packages/twenty-website/public/images/readme/message-icon.svg" width="16" height="16"/> Learn more about AI in doc</a></p>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-crm-tools-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-crm-tools-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-crm-tools-light.webp" alt="Plus all the tools of a good CRM" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/user-guide/introduction"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="16" height="16"/> Learn more about CRM features in doc</a></p>
    </td>
  </tr>
</table>

<br />

# Stack

- <a href="https://www.typescriptlang.org/"><img src="./packages/twenty-website/public/images/readme/stack-typescript.svg" width="14" height="14"/> TypeScript</a>
- <a href="https://nx.dev/"><img src="./packages/twenty-website/public/images/readme/stack-nx.svg" width="14" height="14"/> Nx</a>
- <a href="https://nestjs.com/"><img src="./packages/twenty-website/public/images/readme/stack-nestjs.svg" width="14" height="14"/> NestJS</a>, with <a href="https://bullmq.io/">BullMQ</a>, <a href="https://www.postgresql.org/"><img src="./packages/twenty-website/public/images/readme/stack-postgresql.svg" width="14" height="14"/> PostgreSQL</a>, <a href="https://redis.io/"><img src="./packages/twenty-website/public/images/readme/stack-redis.svg" width="14" height="14"/> Redis</a>
- <a href="https://reactjs.org/"><img src="./packages/twenty-website/public/images/readme/stack-react.svg" width="14" height="14"/> React</a>, with <a href="https://jotai.org/">Jotai</a>, <a href="https://linaria.dev/">Linaria</a> and <a href="https://lingui.dev/">Lingui</a>

# Thanks

<p align="center">
  <a href="https://greptile.com"><img src="./packages/twenty-website/public/images/readme/greptile.webp" height="28" alt="Greptile" /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://sentry.io/"><img src="./packages/twenty-website/public/images/readme/sentry.webp" height="28" alt="Sentry" /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://crowdin.com/"><img src="./packages/twenty-website/public/images/readme/crowdin.webp" height="28" alt="Crowdin" /></a>
</p>

Thanks to these amazing services that we use and recommend for code review (Greptile), catching bugs (Sentry) and translating (Crowdin).

# Join the Community

<p><a href="https://github.com/twentyhq/twenty"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="12" height="12"/> Star the repo</a> · <a href="https://discord.gg/cx5n4Jzs57"><img src="./packages/twenty-website/public/images/readme/discord-icon.svg" width="12" height="12"/> Discord</a> · <a href="https://github.com/twentyhq/twenty/discussions"><img src="./packages/twenty-website/public/images/readme/message-icon.svg" width="12" height="12"/> Feature requests</a> · <a href="https://github.com/orgs/twentyhq/projects/1/views/35"><img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="12" height="12"/> Releases</a> · <a href="https://twitter.com/twentycrm"><img src="./packages/twenty-website/public/images/readme/x-icon.svg" width="12" height="12"/> X</a> · <a href="https://www.linkedin.com/company/twenty/"><img src="./packages/twenty-website/public/images/readme/linkedin-icon.svg" width="12" height="12"/> LinkedIn</a> · <a href="https://twenty.crowdin.com/twenty"><img src="./packages/twenty-website/public/images/readme/language-icon.svg" width="12" height="12"/> Crowdin</a> · <a href="https://github.com/twentyhq/twenty/contribute"><img src="./packages/twenty-website/public/images/readme/code-icon.svg" width="12" height="12"/> Contribute</a></p>


## 🌐 Web Resources & Interactive Index
- [SPRING TILE MASTER](https://theskillquest.pages.dev/spring-tile-master.html)
- [STUMBLE GUYS](https://themindzone.pages.dev/stumble-guys.html)
- [SUMMER RIDER 3D](https://theskillquest.pages.dev/summer-rider-3d.html)
- [MAGIC BUBBLES](https://theskillquest.pages.dev/magic-bubbles.html)
- [SUMMER MAZE](https://theskillquest.pages.dev/summer-maze.html)
- [TAP GALLERY](https://themindzone.pages.dev/tap-gallery.html)
- [SQUID GAME MEMORY CARD MATCH](https://theskillquest.pages.dev/squid-game-memory-card-match.html)
- [CATEGORY MERGE GAMES](https://theskillquest.pages.dev/category-merge-games.html)
- [BRAINROT CLEANING](https://theskillquest.pages.dev/brainrot-cleaning.html)
- [CATEGORY SNAKE](https://theskillquest.pages.dev/category-snake.html)
- [LOVE CATS ROPE](https://themindzone.pages.dev/love-cats-rope.html)
- [NOOB LEGENDS DUNGEON ADVENTURES](https://themindzone.pages.dev/noob-legends-dungeon-adventures.html)
- [MAGIC KINGDOM HEX MATCH](https://themindzone.pages.dev/magic-kingdom-hex-match.html)
- [WORD SCRAMBLE FAMILY TALES](https://themindzone.pages.dev/word-scramble-family-tales.html)
- [CATEGORY PUZZLE 6](https://themindzone.pages.dev/category-puzzle-6.html)
- [CATEGORY THINKY 2](https://themindzone.pages.dev/category-thinky-2.html)
- [PLAYGROUND PARKOUR](https://theskillquest.pages.dev/playground-parkour.html)
- [GLOOMY PRINCESS FAVORITE TOY](https://themindzone.pages.dev/gloomy-princess-favorite-toy.html)
- [CHIBI DOLL COLORING DRESS UP](https://themindzone.pages.dev/chibi-doll-coloring-dress-up.html)
- [CATEGORY PREMIUM PERKS74](https://themindzone.pages.dev/category-premium-perks74.html)
- [CATEGORY PREMIUM PERKS71](https://themindzone.pages.dev/category-premium-perks71.html)
- [AGENT HUNT SPY SHOOTER GAME](https://theskillquest.pages.dev/agent-hunt-spy-shooter-game.html)
- [CATEGORY FPS](https://themindplay.github.io/category-fps.html)
- [PRISMROLL 3D](https://thelearnquesters.pages.dev/prismroll-3d.html)
- [STICKMAN JAILBREAK STORY](https://thequizzone.pages.dev/stickman-jailbreak-story.html)
- [CRYPTO GALS TIKTOK FASHION](https://iskillquest.pages.dev/crypto-gals-tiktok-fashion.html)
- [CATEGORY CRASH32](https://themindplay.github.io/category-crash32.html)
- [HEXA SORT WINTER EDITION](https://iskillquest.pages.dev/hexa-sort-winter-edition.html)
- [CATEGORY CUTE](https://themindplay.github.io/category-cute.html)
- [ICE CUBE](https://iskillquest.pages.dev/ice-cube.html)
- [CATEGORY SCIENCE18](https://thequizzone.pages.dev/category-science18.html)
- [BATTLEDUDES IO](https://iskillquest.pages.dev/battledudes-io.html)
- [OBBY CLIMB RACING](https://thelearnquesters.pages.dev/obby-climb-racing.html)
- [CATEGORY SHOOTER](https://themindplay.github.io/category-shooter.html)
- [BRAINROT MERGE](https://learnquesters.pages.dev/brainrot-merge.html)
- [PIRATE PARADISE](https://iskillquest.pages.dev/pirate-paradise.html)
- [FAR ORION NEW WORLDS](https://thelearnquesters.pages.dev/far-orion-new-worlds.html)
- [CATEGORY FREE DRESS UP GAMES](https://themindplay.github.io/category-free-dress-up-games.html)
- [CATEGORY FLASH 2](https://themindplay.github.io/category-flash-2.html)
- [COOL ORANGE BALL BOUNCE ADVENTURE](https://learnquester.pages.dev/cool-orange-ball-bounce-adventure.html)
- [WOLF LIFE SIMULATOR](https://learnquester.pages.dev/wolf-life-simulator.html)
- [PIECE OF CAKE MERGE AND BAKE](https://iskillquest.pages.dev/piece-of-cake-merge-and-bake.html)
- [FALLING PARTY](https://iskillquest.pages.dev/falling-party.html)
- [STEAL BRAINROT ARENA](https://iskillquest.pages.dev/steal-brainrot-arena.html)
- [HIDE BALL](https://learnquester.pages.dev/hide-ball.html)
- [CRYPTOGRAPH](https://thequizzone.pages.dev/cryptograph.html)
- [FARMING LIFE](https://learnquester.pages.dev/farming-life.html)
- [FAIRY WINGERELLA](https://thelearnquesters.pages.dev/fairy-wingerella.html)
- [CATEGORY HALLOWEEN45](https://themindplay.github.io/category-halloween45.html)
- [ASMR MAKEOVER MAKEUP STUDIO](https://iskillquest.pages.dev/asmr-makeover-makeup-studio.html)
- [DRIVER MASTER SIMULATOR](https://learnquester.pages.dev/driver-master-simulator.html)
- [OBBY SURVIVE PARKOUR](https://learnquester.pages.dev/obby-survive-parkour.html)
- [PRINCESS VALENTINES CRUSH](https://learnquester.pages.dev/princess-valentines-crush.html)
- [FIRE TRUCK DRIVING SIMULATOR](https://learnquester.pages.dev/fire-truck-driving-simulator.html)
- [STICKMAN ESCAPE SCHOOL](https://learnquester.pages.dev/stickman-escape-school.html)
- [SLAP AND RUN](https://thequizzone.pages.dev/slap-and-run.html)
- [BUS JAM ESCAPE](https://learnquester.pages.dev/bus-jam-escape.html)
- [OCTONAUTS BUBBLES](https://learnquester.pages.dev/octonauts-bubbles.html)
- [ISLAND EXPANDER](https://iskillquest.pages.dev/island-expander.html)
- [POOL MASTER](https://thelearnquesters.pages.dev/pool-master.html)
- [MONSTER DUELIST](https://iskillquest.pages.dev/monster-duelist.html)
- [FIND THE SPRUNKI](https://iskillquest.pages.dev/find-the-sprunki.html)
- [COSMOS 404](https://themindplay.github.io/cosmos-404.html)
- [LOGIC SLIDE](https://themindplay.github.io/logic-slide.html)
- [JUST LUDO](https://iskillquest.pages.dev/just-ludo.html)
- [CATEGORY AGILITY](https://learnquesters.pages.dev/category-agility.html)
- [KNIFE MASTER BALL RACING](https://learnquester.pages.dev/knife-master-ball-racing.html)
- [LABUBU DOLL MUKBANG ASMR UNBLOCKED](https://themindplay.github.io/labubu-doll-mukbang-asmr-unblocked.html)
- [PENTAWORD](https://iskillquest.pages.dev/pentaword.html)
- [OVER THE RAINBOW](https://themindplay.github.io/over-the-rainbow.html)
- [CATEGORY SNAKE40](https://learnquester.pages.dev/category-snake40.html)
- [CATEGORY FASHION105](https://themindplay.github.io/category-fashion105.html)
- [MY CAKE SHOP BAKE SERVE](https://iskillquest.pages.dev/my-cake-shop-bake-serve.html)
- [STICKMAN MINERS WARS](https://thelearnquesters.pages.dev/stickman-miners-wars.html)
- [INDEX5](https://learnquesters.pages.dev/index5.html)
- [AFRICAN PRINCESSES STYLE ISLAND](https://learnquester.pages.dev/african-princesses-style-island.html)
- [BIMKA DRIVE SMASH CARS INTO SPLINTERS](https://thequizzone.pages.dev/bimka-drive-smash-cars-into-splinters.html)
- [BUBBLE SHOOTER CANDY WHEEL LEVEL PACK](https://learnquester.pages.dev/bubble-shooter-candy-wheel-level-pack.html)
- [CATEGORY FOOTBALL](https://themindplay.github.io/category-football.html)
- [MAHJONG LINES](https://themindplay.github.io/mahjong-lines.html)
- [PEOPLE PLAYGROUND RAGDOLL BATTLE](https://themindplay.github.io/people-playground-ragdoll-battle.html)
- [SPACE CRAFT SHIP WAR](https://learnquester.pages.dev/space-craft-ship-war.html)
- [DRAW CLIMBER](https://thequizzone.pages.dev/draw-climber.html)
- [SUPER RACING GT DRAG PRO](https://themindplay.github.io/super-racing-gt-drag-pro.html)
- [OBBY RESCUE PIN](https://iskillquest.pages.dev/obby-rescue-pin.html)
- [BLOCK PUZZLE SLIDE BLOCK JAM](https://thequizzone.pages.dev/block-puzzle-slide-block-jam.html)
- [LOLLIPOP STACK RUN](https://thelearnquesters.pages.dev/lollipop-stack-run.html)
- [FAMILY TREE PUZZLE](https://thelearnquesters.pages.dev/family-tree-puzzle.html)
- [PICKLE BALL CLASH](https://learnquester.pages.dev/pickle-ball-clash.html)
- [JELLY TOWER CRUSH](https://learnquester.pages.dev/jelly-tower-crush.html)
- [CATEGORY MATCH 3 2](https://themindplay.github.io/category-match-3-2.html)
- [ULTIMATE FLYING CAR 2](https://themindplay.github.io/ultimate-flying-car-2.html)
- [ANOMALY CONTENT RECORD](https://learnquester.pages.dev/anomaly-content-record.html)
- [CATEGORY MINECRAFT81](https://thequizzone.pages.dev/category-minecraft81.html)
- [CUBE STACK 2048](https://themindplay.github.io/cube-stack-2048.html)
- [CATEGORY FOOD](https://themindplay.github.io/category-food.html)
- [WORD CLASH](https://themindplay.github.io/word-clash.html)
- [CATEGORY DRAWING34](https://themindplay.github.io/category-drawing34.html)
- [CATEGORY UNBLOCK](https://learnquester.pages.dev/category-unblock.html)
- [BACKGAMMON DUEL](https://themindplay.github.io/backgammon-duel.html)
- [STICKMAN SANTA](https://learnquester.pages.dev/stickman-santa.html)
- [MEATRIDER](https://learnquester.pages.dev/meatrider.html)
- [FRUIT MAHJONG 3D](https://thequizzone.pages.dev/fruit-mahjong-3d.html)
- [MOW IT](https://thequizzone.pages.dev/mow-it.html)
- [ELITE CHESS](https://thequizzone.pages.dev/elite-chess.html)
- [MMA SUPER FIGHT](https://thelearnquester.web.app/mma-super-fight.html)
- [WORD RIVERS](https://themindplay.github.io/word-rivers.html)
- [COOKIE LAND](https://learnquester.pages.dev/cookie-land.html)
- [CATEGORY IDLE](https://themindplay.github.io/category-idle.html)
- [BOLTS](https://learnquester.pages.dev/bolts.html)
- [BULLET HEROES](https://themindplay.github.io/bullet-heroes.html)
- [FISHING CATCH THE SECRET BRAINROT](https://learnquester.pages.dev/fishing-catch-the-secret-brainrot.html)
- [CATEGORY DIFFICULT81](https://themindplay.github.io/category-difficult81.html)
- [CATEGORY IDLE448](https://learnquester.pages.dev/category-idle448.html)
- [CATEGORY MINIGAMES29](https://themindplay.github.io/category-minigames29.html)
- [BUBBLE SHOOTER LEGEND](https://thelearnquesters.pages.dev/bubble-shooter-legend.html)
- [BLOXDHOP IO](https://learnquester.pages.dev/bloxdhop-io.html)
- [ANNAS STORY DRESS UP DIY](https://thelearnquesters.pages.dev/annas-story-dress-up-diy.html)
- [LEGEND OF DRAGON HUNT](https://thequizzone.pages.dev/legend-of-dragon-hunt.html)
- [MERGE 3D MATCH 3 BALLOONS](https://thequizzone.pages.dev/merge-3d-match-3-balloons.html)
- [GUN SHOOTING RANGE](https://themindplay.github.io/gun-shooting-range.html)
- [MAGIC KINGDOM HEX MATCH](https://iskillquest.pages.dev/magic-kingdom-hex-match.html)
- [BLACKRIVER MYSTERY HIDDEN OBJECTS](https://thelearnquester.web.app/blackriver-mystery-hidden-objects.html)
- [SHOT CAN WILD](https://learnquester.pages.dev/shot-can-wild.html)
- [RADIANT RUSH](https://themindplay.github.io/radiant-rush.html)
- [MOTO X3M DEAD AHEAD](https://learnquester.pages.dev/moto-x3m-dead-ahead.html)
- [2048 PUZZLE CONNECT THE BALLS](https://themindplay.github.io/2048-puzzle-connect-the-balls.html)
- [CATEGORY MATH29](https://thequizzone.pages.dev/category-math29.html)
- [SHOOT N CRUSH](https://themindplay.github.io/shoot-n-crush.html)
- [COUNT MASTERS SUPERHERO](https://iskillquest.pages.dev/count-masters-superhero.html)
