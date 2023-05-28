FROM node:18.16.0 as front

WORKDIR /app/front

COPY ../../front/package.json .
COPY ../../front/package-lock.json .
RUN npm install
RUN npx playwright install-deps 

WORKDIR /app/server

COPY ../../server/package.json .
COPY ../../server/package-lock.json .
RUN npm install

WORKDIR /app

COPY ../.. .

WORKDIR /app/server
RUN npx prisma generate

WORKDIR /app

CMD ["tail", "-f", "/dev/null"]
