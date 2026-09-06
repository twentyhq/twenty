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
- [SPRUNKI](https://themindzone.pages.dev/sprunki.html)
- [BLOCK BUILDER JAM](https://studyquests.github.io/block-builder-jam.html)
- [CATEGORY MAHJONG37](https://studyplaying.github.io/category-mahjong37.html)
- [COOL ORANGE BALL BOUNCE ADVENTURE](https://studyplaying.github.io/cool-orange-ball-bounce-adventure.html)
- [MOJO EMOJI](https://studyquests.pages.dev/mojo-emoji.html)
- [SOFT GIRLS WINTER AESTHETICS](https://studyplaying.github.io/soft-girls-winter-aesthetics.html)
- [CATEGORY MAKEUP](https://studyplaying.github.io/category-makeup.html)
- [BALL AND GIRLFRIEND](https://studyplaying.github.io/ball-and-girlfriend.html)
- [CATEGORY QUIZ40](https://studyplaying.github.io/category-quiz40.html)
- [MOON LEAGUE SPORTS SEASON](https://learnquester.github.io/moon-league-sports-season.html)
- [CATEGORY SHOOTER 2](https://studyplayings.pages.dev/category-shooter-2.html)
- [CATEGORY MAHJONG](https://studyplaying.github.io/category-mahjong.html)
- [WINTER GIFTS](https://studyplaying.github.io/winter-gifts.html)
- [MINICRAFT WINTERBLOCK](https://studyplayings.pages.dev/minicraft-winterblock.html)
- [ELLIE AND FRIENDS ART BLOOM AESTHETIC](https://studyplayings.pages.dev/ellie-and-friends-art-bloom-aesthetic.html)
- [MERGE MASTER SKIBIDI BOP](https://studyplaying.github.io/merge-master-skibidi-bop.html)
- [LOVIE CHICS COACHELLA FESTIVAL](https://studyplayings.pages.dev/lovie-chics-coachella-festival.html)
- [HIDDEN OBJECT TIME TRAVEL](https://studyplayings.web.app/hidden-object-time-travel.html)
- [PANDA RESTAURANT](https://studyplayings.web.app/panda-restaurant.html)
- [CAR SERVICE TYCOON](https://studyplayings.pages.dev/car-service-tycoon.html)
- [CATEGORY OBSTACLE299](https://studyplaying.github.io/category-obstacle299.html)
- [LABUBU POP](https://studyplayings.pages.dev/labubu-pop.html)
- [PARIS KISS](https://studyplayings.web.app/paris-kiss.html)
- [DEAR ISLAND](https://studyplaying.github.io/dear-island.html)
- [MOLANG MATCHN MUNCH](https://studyquests.pages.dev/molang-matchn-munch.html)
- [BUBBLE SHOOTER PRO 4](https://studyplayings.web.app/bubble-shooter-pro-4.html)
- [JELI2D](https://studyplayings.web.app/jeli2d.html)
- [TARCAT](https://studyplaying.github.io/tarcat.html)
- [ANNOYING BOSS PUNCH GAME](https://studyplayings.web.app/annoying-boss-punch-game.html)
- [BLOCKS BREAKER](https://studyplayings.web.app/blocks-breaker.html)
- [CATEGORY TANK58](https://studyplayings.pages.dev/category-tank58.html)
- [ASMR BEAUTY CLINIC](https://studyplayings.web.app/asmr-beauty-clinic.html)
- [ANIMAL TRANSFORM RACE](https://studyquests.pages.dev/animal-transform-race.html)
- [SOLITAIRE TAIL](https://studyplaying.github.io/solitaire-tail.html)
- [CATEGORY AVOID295](https://studyplayings.web.app/category-avoid295.html)
- [VAMPIRIC ROULETTE ROMANCE](https://studyquests.pages.dev/vampiric-roulette-romance.html)
- [CRAZYSTEVEIO](https://studyplayings.pages.dev/crazysteveio.html)
- [CATEGORY MAHJONG CONNECT](https://studyplayings.web.app/category-mahjong-connect.html)
- [BUTTERFLY EAR CUFF JEWELRY](https://studyquests.pages.dev/butterfly-ear-cuff-jewelry.html)
- [DIGITAL CIRCUS RUN](https://studyplayings.pages.dev/digital-circus-run.html)
- [CRAFT MAN VS GIANT TNT](https://studyplayings.web.app/craft-man-vs-giant-tnt.html)
- [CATEGORY UNBLOCKED](https://studyplayings.pages.dev/category-unblocked.html)
- [CATEGORY CASUAL971](https://studyplayings.web.app/category-casual971.html)
- [BADLAND](https://studyplayings.pages.dev/badland.html)
- [GRAVITY MATCHER](https://studyplayings.pages.dev/gravity-matcher.html)
- [COLOR SCREW RESCUE PUZZLE](https://studyplayings.web.app/color-screw-rescue-puzzle.html)
- [FOOTBALL FUN](https://studyquests.pages.dev/football-fun.html)
- [CATEGORY FASHION](https://studyplayings.web.app/category-fashion.html)
- [CATEGORY MMO25](https://studyplaying.github.io/category-mmo25.html)
- [CAR PARKING SIMULATOR](https://studyplayings.pages.dev/car-parking-simulator.html)
- [FOOT CHINKO RUSSIA 2018](https://studyplaying.github.io/foot-chinko-russia-2018.html)
- [SUSTAINABLE](https://studyplayings.pages.dev/sustainable.html)
- [CATEGORY BATTLE523](https://studyplayings.web.app/category-battle523.html)
- [IDLE BASEBALL TYCOON](https://studyquests.pages.dev/idle-baseball-tycoon.html)
- [CATEGORY STICKMAN 2](https://studyplayings.pages.dev/category-stickman-2.html)
- [CANNON BLAST THE LAST STAND](https://studyplayings.pages.dev/cannon-blast-the-last-stand.html)
- [LEVEL EATEN](https://studyplaying.github.io/level-eaten.html)
- [SNIPER SHOT SECRET MISSION](https://studyplaying.github.io/sniper-shot-secret-mission.html)
- [EGG ADVENTURE](https://studyplaying.github.io/egg-adventure.html)
- [OFFLINE FPS ROYALE](https://studyplayings.pages.dev/offline-fps-royale.html)
- [GT TRAFFIC RACER](https://studyplayings.web.app/gt-traffic-racer.html)
- [HIDDEN OBJECTS](https://studyplayings.web.app/hidden-objects.html)
- [STICKMAN PUNISHMENT](https://studyplayings.web.app/stickman-punishment.html)
- [BLOCK DROPPING MERGE](https://studyplayings.pages.dev/block-dropping-merge.html)
- [SECRETS OF CHARMLAND](https://studyquesthub.web.app/secrets-of-charmland.html)
- [SHOOT RUN MONSTER HUNTING](https://studyplayings.pages.dev/shoot-run-monster-hunting.html)
- [SWEETSU TILE PUZZLE](https://studyplayings.pages.dev/sweetsu-tile-puzzle.html)
- [CATEGORY BLOCK91](https://studyplayings.web.app/category-block91.html)
- [CATEGORY CAT55](https://studyplayings.web.app/category-cat55.html)
- [FLAG MASTER WORLD FLAGS QUIZ](https://studyplayings.web.app/flag-master-world-flags-quiz.html)
- [VEGAMIX DA VINCI PUZZLES](https://studyplayings.web.app/vegamix-da-vinci-puzzles.html)
- [DEVIL DASH](https://studyplaying.github.io/devil-dash.html)
- [PAPA BUZJA](https://studyplaying.github.io/papa-buzja.html)
- [MERRY CHRISTMAS CONNECT](https://studyplayings.pages.dev/merry-christmas-connect.html)
- [SCARY BANBAN ESCAPE](https://studyplayings.pages.dev/scary-banban-escape.html)
- [SPACE SURVIVAL RAINBOW FRIENDS MONSTER](https://studyplayings.pages.dev/space-survival-rainbow-friends-monster.html)
- [BALLOON POP FRENZY](https://studyplayings.pages.dev/balloon-pop-frenzy.html)
- [AIRPORT SECURITY](https://studyplaying.github.io/airport-security.html)
- [SIMON SUPER RABBIT](https://studyplayings.pages.dev/simon-super-rabbit.html)
- [SKYDOM REFORGED](https://studyplayings.pages.dev/skydom-reforged.html)
- [SORTING SORCERY](https://learnquester.github.io/sorting-sorcery.html)
- [MOJICON SPRING CONNECT](https://studyplayings.web.app/mojicon-spring-connect.html)
- [RAINBOW FRIENDS HIDE AND SEEK](https://studyplayings.web.app/rainbow-friends-hide-and-seek.html)
- [CATEGORY CASUAL 3](https://studyplayings.web.app/category-casual-3.html)
- [WHEEL OF BINGO](https://studyplayings.web.app/wheel-of-bingo.html)
- [CATEGORY RACING DRIVING 2](https://learnquester.github.io/category-racing-driving-2.html)
- [CATEGORY RETRO27](https://studyquests.pages.dev/category-retro27.html)
- [AIRPORT MASTER PLANE TYCOON](https://learnquester.github.io/airport-master-plane-tycoon.html)
- [POOL MERGE](https://studyplayings.web.app/pool-merge.html)
- [BOOM STICK BAZOOKA](https://studyplaying.github.io/boom-stick-bazooka.html)
- [CATEGORY GROW GAMES](https://learnquester.github.io/category-grow-games.html)
- [CATEGORY ANIMAL216](https://learnquester.github.io/category-animal216.html)
- [STICKMAN JAILBREAK STORY](https://studyplaying.github.io/stickman-jailbreak-story.html)
- [OBBY HIGHEST JUMP EVER](https://learnquester.github.io/obby-highest-jump-ever.html)
- [HERO WIZARD SAVE YOUR GIRLFRIEND](https://learnquester.github.io/hero-wizard-save-your-girlfriend.html)
- [ARROW CUBE ESCAPE](https://learnquester.github.io/arrow-cube-escape.html)
- [WORD STARS](https://learnquester.github.io/word-stars.html)
- [FISHING BARON REAL FISHING](https://learnquester.github.io/fishing-baron-real-fishing.html)
- [DIGIT SHOOTER](https://studyplayings.web.app/digit-shooter.html)
- [AUTUMN GLAM GALA](https://studyplayings.web.app/autumn-glam-gala.html)
- [TRUCKTOPOLIS COOKING CHAOS](https://learnquester.github.io/trucktopolis-cooking-chaos.html)
- [STUNT BIKE RIDER BROS](https://studyplayings.web.app/stunt-bike-rider-bros.html)
- [HILL CLIMBING MANIA](https://learnquester.github.io/hill-climbing-mania.html)
- [STEAL BRAINROT ARENA](https://studyplayings.web.app/steal-brainrot-arena.html)
- [ROYAL PUZZLE BURST](https://studyquests.pages.dev/royal-puzzle-burst.html)
- [CATEGORY BATTLE](https://studyplayings.web.app/category-battle.html)
- [CYBER HIGHWAY ESCAPE](https://studyplaying.github.io/cyber-highway-escape.html)
- [CATEGORY RACING DRIVING](https://studyplayings.pages.dev/category-racing-driving.html)
- [CATEGORY BATTLE](https://thelearnquester.web.app/category-battle.html)
- [THUMBPINBALL](https://studyplayings.pages.dev/thumbpinball.html)
- [HEROBALL ADVENTURES 2](https://studyquests.pages.dev/heroball-adventures-2.html)
- [HIDE AND SEEK BLUE MONSTER](https://iskillquest.pages.dev/hide-and-seek-blue-monster.html)
- [SWIPETOWN](https://studyquests.pages.dev/swipetown.html)
- [STUMBLE GUYS](https://themindzone.pages.dev/stumble-guys.html)
- [HIDDEN PAIRS MAHJONG](https://themindzone.pages.dev/hidden-pairs-mahjong.html)
- [ROYAL CROWN BLAST](https://themindzone.pages.dev/royal-crown-blast.html)
- [TILE MATCH CAFE](https://studyplaying.github.io/tile-match-cafe.html)
- [NINJA CROSSWORD CHALLENGE](https://themindzone.pages.dev/ninja-crossword-challenge.html)
- [CATEGORY COLLECT565](https://studyquests.pages.dev/category-collect565.html)
- [BUBBLE SHOOTER POP](https://studyplaying.github.io/bubble-shooter-pop.html)
- [BFFS K POP FANGIRLS](https://studyplaying.github.io/bffs-k-pop-fangirls.html)
- [SKIBRONX RUNNER](https://themindzone.pages.dev/skibronx-runner.html)
- [JUICE MERGE](https://themindzone.pages.dev/juice-merge.html)
- [IDLE LEGEND](https://themindzone.pages.dev/idle-legend.html)
- [SCREWDOM 3D](https://studyplayings.pages.dev/screwdom-3d.html)
- [HORROR HOTEL SCARY ROOM](https://themindzone.pages.dev/horror-hotel-scary-room.html)
- [STICK FIGHT THE CHAOS](https://studyquests.pages.dev/stick-fight-the-chaos.html)
- [UFO ATTACK](https://themindzone.pages.dev/ufo-attack.html)
- [GOOSE CUP](https://themindzone.pages.dev/goose-cup.html)
- [ROAD OF FURY 4](https://themindzone.pages.dev/road-of-fury-4.html)
