FROM node:24-alpine AS twenty-website-build


WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches
COPY ./tools/eslint-rules /app/tools/eslint-rules
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-website/package.json /app/packages/twenty-website/package.json

RUN yarn

ENV KEYSTATIC_GITHUB_CLIENT_ID="<fake build value>"
ENV KEYSTATIC_GITHUB_CLIENT_SECRET="<fake build value>"
ENV KEYSTATIC_SECRET="<fake build value>"
ENV NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG="<fake build value>"

COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-website /app/packages/twenty-website
RUN npx nx build twenty-website

FROM node:24-alpine AS twenty-website

WORKDIR /app/packages/twenty-website

COPY --from=twenty-website-build /app /app

WORKDIR /app/packages/twenty-website

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the website."

RUN chown -R 1000 /app

# Use non root user with uid 1000
USER 1000

CMD ["/bin/sh", "-c", "npx nx start"]