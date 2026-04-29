FROM node:24-alpine AS twenty-website-new-build


WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./tsconfig.base.json .
COPY ./nx.json .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches
COPY ./packages/twenty-oxlint-rules /app/packages/twenty-oxlint-rules
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/package.json
COPY ./packages/twenty-website-new/package.json /app/packages/twenty-website-new/package.json

RUN yarn

COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-website-new /app/packages/twenty-website-new
RUN npx nx build twenty-website-new

FROM node:24-alpine AS twenty-website-new

WORKDIR /app/packages/twenty-website-new

COPY --from=twenty-website-new-build /app /app

WORKDIR /app/packages/twenty-website-new

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the new marketing website."

RUN chown -R 1000 /app

# Use non root user with uid 1000
USER 1000

CMD ["/bin/sh", "-c", "npx nx start twenty-website-new"]
